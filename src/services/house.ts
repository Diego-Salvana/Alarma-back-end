import { IncomingHttpHeaders } from 'http2';
import { Casa, Estado, ExcludeArrayDTO, HouseResponse, JwtPayloadExt, Lights, HouseAction, AlarmArming, WarningType, TriggeredAlarm } from '../interfaces';
import { HouseDataAccess, UserDataAccess } from '../models';
import { AlreadyExists, NotFound, WarningFactory } from '../utils';
import { HouseDTO } from './house-dto';
import { MosquittoAccess } from '../mqtt';
import { WebSocketAccess } from '../websocket/websocket-access';

/** Servicio que administra operaciones con la BD y lógica de negocio vinculada a Casas. */
export class HouseService {
  private houseDTO = new HouseDTO();

  constructor (
    private userDataAccess: UserDataAccess,
    private houseDataAccess: HouseDataAccess,
    private webSocketAccess: WebSocketAccess,
    private mosquittoAccess: MosquittoAccess
  ) {}

  /** Crea una nueva casa para el usuario. */
  async create (body: Casa, userPayload: JwtPayloadExt): Promise<void> {
    const userId = userPayload.sub;
    const houseData: Casa = { ...body, nombreCasa: body.nombre.toLowerCase().replace(/\s/g, '') };
    const user = await this.houseDataAccess.create(userId, houseData);

    if (user === null) throw new NotFound('Usuario no encontrado');
  }

  /** Obtiene todas las casas del usuario. */
  async getAll (userPayload: JwtPayloadExt): Promise<HouseResponse[]> {
    const userId = userPayload.sub;
    const allUserHouses = await this.houseDataAccess.getAllByUserId(userId);

    if (allUserHouses === null) throw new NotFound('Casas no encontradas');

    return this.houseDTO.housesListResponse(allUserHouses);
  }

  /** Obtiene una casa específica del usuario. */
  async getOne (houseId: string, userPayload: JwtPayloadExt, headers: IncomingHttpHeaders):
  Promise<HouseResponse> {
    const userId = userPayload.sub;
    const house = await this.houseDataAccess.getOne(houseId, userId);

    if (house === null) throw new NotFound('Casa no encontrada');

    const tokenRequired = headers['set-house'] === 'true';

    return this.houseDTO.houseResponse(house, tokenRequired ? userId : undefined, tokenRequired);
  }

  /**
    * Actualiza una casa del usuario
    * verificando que no exista otra con el mismo nombre o dirección.
  */
  async update (houseId: string, userPayload: JwtPayloadExt, body: Partial<Casa>):
  Promise<HouseResponse> {
    const userId = userPayload.sub;
    const allUserHouses = await this.houseDataAccess.getAllByUserId(userId);
    const otherHouses = allUserHouses.filter(house => house._id.toString() !== houseId);
    const nameExists = otherHouses.some(h =>
      h.nombre.trim().toLowerCase() === body.nombre?.trim().toLowerCase()
    );

    if (nameExists) {
      throw new AlreadyExists(`Ya existe una casa con el nombre: ${body.nombre ?? ''}`);
    }

    const addressExists = otherHouses.some(h =>
      h.direccion.calle.trim().toLowerCase() === body.direccion?.calle.trim().toLowerCase() &&
      h.direccion.numero === body.direccion?.numero &&
      h.direccion.ciudad.trim().toLowerCase() === body.direccion?.ciudad.trim().toLowerCase()
    );

    if (addressExists) {
      throw new AlreadyExists(`Ya existe otra casa con la dirección: ${body.direccion?.calle ?? ''} ${body.direccion?.numero ?? ''}, ${body.direccion?.ciudad ?? ''}`);
    }

    const updatedHouse = await this.houseDataAccess.update(houseId, userId, body);

    return this.houseDTO.houseResponse(updatedHouse);
  }

  /** Borra una casa del usuario. */
  async delete (houseId: string, userPayload: JwtPayloadExt): Promise<void> {
    const userId = userPayload.sub;
    await this.houseDataAccess.delete(houseId, userId);
  }

  /** Publica a Mosquitto mensaje de Encendido o Apagado de alarma según los parámetros. */
  async setAlarmState (userPayload: JwtPayloadExt, state: Estado, body?: ExcludeArrayDTO):
  Promise<void> {
    let username = '';
    let houseName = '';
    
    try {
      [username, houseName] = await this.getUsernameAndHouseName(userPayload);
    } catch (err: any) {
      console.log('Error al Setear la Alarma: ', err.message);
      this.sendWarningById(userPayload.sub, WarningType.DEVICE_STATE);
      return;
    }

    const exclusionArray = body?.exclusionArray ?? [];
    const excludedSensors = exclusionArray.reduce<string[]>((acum, sensor) => {
      if (sensor.estado !== Estado.ENCENDIDO) acum.push(sensor.numeroSensor.toString());
      return acum;
    }, []).join(',');
    const message = `${state}:${excludedSensors}`;

    this.mosquittoAccess.publicMessage(HouseAction.SET_ARMED_STATE, message, username, houseName);
  }

  /** Publica mensaje para cambiar estado de luces en Mosquitto */
  async setLightsState (userPayload: JwtPayloadExt, { sector, state }: Lights): Promise<void> {
    let username = '';
    let houseName = '';
    
    try {
      [username, houseName] = await this.getUsernameAndHouseName(userPayload);
    } catch (err: any) {
      console.log('Error al Setear Luces: ', err.message);
      this.sendWarningById(userPayload.sub, WarningType.LIGHTS_STATE);
      return;
    }
    
    const message = `${sector}:${state}`;

    this.mosquittoAccess.publicMessage(HouseAction.SET_LIGHTS, message, username, houseName);
  }

  /** Publica a Mosquitto mensaje de disparo de alarma (sonando) según los parámetros. */
  async setTriggeredState (userPayload: JwtPayloadExt, state: Estado): Promise<void> {
    let username = '';
    let houseName = '';

    try {
      [username, houseName] = await this.getUsernameAndHouseName(userPayload);
    } catch (err: any) {
      console.log('Error al Disparar la Alarma: ', err.message);
      this.sendWarningById(userPayload.sub, WarningType.TRIGGER_ALARM);
      return;
    }

    const message = `${state}`;
    this.mosquittoAccess.publicMessage(HouseAction.TRIGGER_ALARM, message, username, houseName);
  }

  /** Envía información `websockets` al usuario y carga datos en la `DB`. */
  async sendArmingInfo (username: string, houseName: string, info: AlarmArming): Promise<void> {
    const armingBase = process.env.WS_ALARM_ARMING ?? '';
    const triggerBase = process.env.WS_TRIGGER_ALARM ?? '';
    const armingEvent = `${armingBase}/${username}/${houseName}`;
    const triggeredEvent = `${triggerBase}/${username}`;

    this.webSocketAccess.emitSocketData(armingEvent, info);
    
    try {
      if (info.state === Estado.APAGADO) {
        const house = await this.houseDataAccess.getByHouseName(username, houseName);
        if (house === null) throw new NotFound('Casa no encontrada');

        const wasRinging = house.central.sonando;
        if (wasRinging) {
          this.webSocketAccess.emitSocketData(triggeredEvent, { houseName, state: Estado.APAGADO });
        }
      }
      
      info.state === Estado.ENCENDIDO
        ? await this.houseDataAccess.updateAlarmState(username, houseName, info.excludedSensors)
        : await this.houseDataAccess.updateAlarmState(username, houseName);
    } catch (err: any) {
      console.log(`Error (method: "updateCentralState"): ${err.message as string}`);
    }
  }

  /** Publica información de iluminación a través de sockets para un usuario y casa específicos. */
  sendLightsInfo (username: string, houseName: string, info: Lights) {
    const base = process.env.WS_LIGHTS ?? '';
    const socketEvent = `${base}/${username}/${houseName}`;

    this.webSocketAccess.emitSocketData(socketEvent, info);
  }

  /** Publica información de disparo a través de sockets y actualiza BD. */
  async sendTriggeredInfo (username: string, houseName: string, info: TriggeredAlarm): Promise<void> {
    const base = process.env.WS_TRIGGER_ALARM ?? '';
    const socketEvent = `${base}/${username}`;

    this.webSocketAccess.emitSocketData(socketEvent, info);

    try {
      const ringing = info.state === Estado.ENCENDIDO;
      await this.houseDataAccess.updateCentralRinging(username, houseName, ringing);
    } catch (err: any) {
      console.log(`Error (method: "updateCentralRinging"): ${err.message as string}`);
    }
  }

  /** Envía warning a través de sockets al usuario. */
  sendWarningByUsername (username: string, warningType: WarningType) {
    const base = process.env.WS_WARNING ?? '';
    const socketEvent = `${base}/${username}`;
    const warning = WarningFactory.fromType(warningType);

    this.webSocketAccess.emitSocketData(socketEvent, warning);
  }

  /** Envía warning a través de sockets al usuario por uesrId. */
  sendWarningById (userId: string, warningType: WarningType) {
    const base = process.env.WS_WARNING ?? '';
    const socketEvent = `${base}/${userId}`;
    const warning = WarningFactory.fromType(warningType);

    this.webSocketAccess.emitSocketData(socketEvent, warning);
  }

  /** Método privado que prepara usuario y nombre de casa para operaciones de Mosquitto. */
  private async getUsernameAndHouseName (userPayload: JwtPayloadExt): Promise<[string, string]> {
    const userId = userPayload.sub;
    const houseId = userPayload.hid;

    const user = await this.userDataAccess.getById(userId);
    if (!user) throw new Error('No se encontró usuario.');

    const house = user.casas.find(house => house._id.toString() === houseId);
    if (!house) throw new Error('No se encontró la casa.');

    const userName = user.nombreUsuario;
    const houseName = house.nombreCasa;

    return [userName, houseName];
  }
}
