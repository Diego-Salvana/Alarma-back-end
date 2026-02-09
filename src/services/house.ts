import { Casa, Estado, ExcludeArrayDTO, HouseResponse, Lights, HouseAction, AlarmArming, WarningType, TriggeredAlarm, SessionJwtPayload, ExclusionSensor } from '../interfaces';
import { CentralDataAccess, HouseDataAccess, SensorDataAccess, UserDataAccess } from '../models';
import { AlreadyExists, WarningFactory, HouseDto, BadRequest } from '../utils';
import { MosquittoAccess } from '../mqtt';
import { WebSocketAccess } from '../websocket/websocket-access';

/** Servicio que administra operaciones con la BD y lógica de negocio vinculada a Casas. */
export class HouseService {
  private houseDTO = new HouseDto();

  constructor (
    private userDataAccess: UserDataAccess,
    private houseDataAccess: HouseDataAccess,
    private centralDataAccess: CentralDataAccess,
    private sensorDataAccess: SensorDataAccess,
    private webSocketAccess: WebSocketAccess,
    private mosquittoAccess: MosquittoAccess
  ) {}

  /** Crea una nueva casa para el usuario. */
  async create (body: Casa, userPayload: SessionJwtPayload): Promise<void> {
    const userId = userPayload.sub;
    const houseData: Casa = { ...body, nombreCasa: body.nombre.toLowerCase().replace(/\s/g, '') };
    await this.houseDataAccess.create(userId, houseData);
  }

  /** Obtiene todas las casas del usuario. */
  async getAll (userId: string): Promise<HouseResponse[]> {
    const allUserHouses = await this.houseDataAccess.getAllByUserId(userId);

    return this.houseDTO.housesListResponse(allUserHouses);
  }

  /** Obtiene una casa específica del usuario. */
  async getOne (userId: string, houseId: string, verified: boolean, tokenRequired: boolean):
  Promise<HouseResponse> {
    const house = await this.houseDataAccess.getOne(houseId, userId);

    return this.houseDTO.houseResponse(house, tokenRequired, userId, verified);
  }

  /**
    * Actualiza una casa del usuario
    * verificando que no exista otra con el mismo nombre o dirección.
  */
  async update (userId: string, houseId: string, body: Partial<Casa>):
  Promise<HouseResponse> {
    const allUserHouses = await this.houseDataAccess.getAllByUserId(userId);
    const otherHouses = allUserHouses.filter(house => house._id.toString() !== houseId);
    const nameExists = otherHouses.some(
      h => h.nombre.trim().toLowerCase() === body.nombre?.trim().toLowerCase()
    );

    if (nameExists) throw new AlreadyExists(`Ya existe una casa con el nombre: ${body.nombre ?? ''}`);

    if (body.direccion) {
      const { calle, numero, ciudad } = body.direccion;
      const addressExists = otherHouses.some(h =>
        h.direccion.calle.trim().toLowerCase() === calle.trim().toLowerCase() &&
        h.direccion.numero === numero &&
        h.direccion.ciudad.trim().toLowerCase() === ciudad.trim().toLowerCase()
      );

      if (addressExists) {
        throw new AlreadyExists(
          `Ya existe otra casa con la dirección: ${calle} ${numero}, ${ciudad}`
        );
      }
    }

    const updatedHouse = await this.houseDataAccess.updateHouseInfo(houseId, userId, body);

    return this.houseDTO.houseResponse(updatedHouse);
  }

  /** Borra una casa del usuario. */
  async delete (userId: string, houseId: string): Promise<void> {
    await this.houseDataAccess.delete(houseId, userId);
  }

  /** Valida que al menos un sensor esté encendido. */
  validateArmAlarm (body: ExcludeArrayDTO): void {
    const someActivated = body.exclusionArray.some(
      (sensor: ExclusionSensor) => sensor.estado === Estado.ENCENDIDO
    );

    if (!someActivated) throw new BadRequest('No hay sensores encendidos');
  }

  /** Publica a Mosquitto mensaje de Encendido o Apagado de alarma según los parámetros. */
  async setAlarmState (userId: string, houseId: string, state: Estado, body?: ExcludeArrayDTO):
  Promise<void> {
    let username = '';
    let houseName = '';
    
    try {
      [username, houseName] = await this.getUsernameAndHouseName(userId, houseId);
    } catch (err: any) {
      console.log('Error al Setear la Alarma: ', err.message);
      this.sendWarningById(userId, WarningType.DEVICE_STATE);
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
  async setLightsState (userId: string, houseId: string, { sector, state }: Lights): Promise<void> {
    let username = '';
    let houseName = '';
    
    try {
      [username, houseName] = await this.getUsernameAndHouseName(userId, houseId);
    } catch (err: any) {
      console.log('Error al Setear Luces: ', err.message);
      this.sendWarningById(userId, WarningType.LIGHTS_STATE);
      return;
    }
    
    const message = `${sector}:${state}`;

    this.mosquittoAccess.publicMessage(HouseAction.SET_LIGHTS, message, username, houseName);
  }

  /** Publica a Mosquitto mensaje de disparo de alarma (sonando) según los parámetros. */
  async setTriggeredState (userId: string, houseId: string, state: Estado): Promise<void> {
    let username = '';
    let houseName = '';

    try {
      [username, houseName] = await this.getUsernameAndHouseName(userId, houseId);
    } catch (err: any) {
      console.log('Error al Disparar la Alarma: ', err.message);
      this.sendWarningById(userId, WarningType.TRIGGER_ALARM);
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
        const wasRinging = house.central.sonando;
        if (wasRinging) {
          this.webSocketAccess.emitSocketData(
            triggeredEvent, { house: houseName, state: Estado.APAGADO }
          );
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
      await this.centralDataAccess.updateSirenState(username, houseName, ringing);
      
      const sensorNumber = info.sensorNumber;
      if (sensorNumber) {
        const date = new Date(Date.now());
        await this.sensorDataAccess.addToHistory(username, houseName, sensorNumber, date);
        await this.centralDataAccess.addToHistory(username, houseName, sensorNumber, date);
      }
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
  private async getUsernameAndHouseName (userId: string, houseId: string): Promise<[string, string]> {
    const user = await this.userDataAccess.getById(userId);

    const house = user.casas.find(house => house._id.toString() === houseId);
    if (!house) throw new Error('No se encontró la casa.');

    const userName = user.nombreUsuario;
    const houseName = house.nombreCasa;

    return [userName, houseName];
  }
}
