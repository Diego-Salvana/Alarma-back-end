import { House, State, HouseResponse, Lights, HouseAction, AlarmArming, WarningType, TriggeredAlarm, CreateHouseInfo, SensorArmConfig, Warning } from '../interfaces';
import { CentralDataAccess, HouseDataAccess, SensorDataAccess, UserDataAccess } from '../models';
import { AlreadyExists, WarningFactory, HouseDto } from '../utils';
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
  async create (userId: string, houseData: CreateHouseInfo): Promise<void> {
    const house: Omit<House, '_id'> = {
      ...houseData,
      nombreCasa: this.createHouseName(houseData.nombre),
      sensores: houseData.sensores ?? [],
      camaras: houseData.camaras ?? []
    };
    
    await this.houseDataAccess.create(userId, house);
  }

  /** Obtiene todas las casas del usuario. */
  async getAll (userId: string): Promise<HouseResponse[]> {
    const allUserHouses = await this.houseDataAccess.getAllByUserId(userId);

    return this.houseDTO.housesListResponse(allUserHouses);
  }

  /** Obtiene una casa específica del usuario. */
  async getOne (userId: string, houseId: string, verified: boolean, tokenRequired: boolean):
  Promise<HouseResponse> {
    const house = await this.houseDataAccess.getOne(userId, houseId);

    return this.houseDTO.houseResponse(house, tokenRequired, userId, verified);
  }

  /**
    * Actualiza una casa del usuario
    * verificando que no exista otra con el mismo nombre o dirección.
  */
  async update (userId: string, houseId: string, houseInfo: Partial<House>):
  Promise<HouseResponse> {
    const allUserHouses = await this.houseDataAccess.getAllByUserId(userId);
    const otherHouses = allUserHouses.filter(house => house._id.toString() !== houseId);
    const nameExists = otherHouses.some(
      h => h.nombre.trim().toLowerCase() === houseInfo.nombre?.trim().toLowerCase()
    );

    if (nameExists) {
      throw new AlreadyExists(`Ya existe una casa con el nombre: ${houseInfo.nombre ?? ''}`);
    }

    if (houseInfo.direccion) {
      const { calle, numero, ciudad } = houseInfo.direccion;
      const addressExists = otherHouses.some(h =>
        h.direccion.calle.trim().toLowerCase() === calle?.trim().toLowerCase() &&
        h.direccion.numero === numero &&
        h.direccion.ciudad.trim().toLowerCase() === ciudad?.trim().toLowerCase()
      );

      if (addressExists) {
        throw new AlreadyExists(
          `Ya existe otra casa con la dirección: ${calle} ${numero}, ${ciudad}`
        );
      }
    }

    const updatedHouse = await this.houseDataAccess.updateHouseInfo(userId, houseId, houseInfo);

    return this.houseDTO.houseResponse(updatedHouse);
  }

  async updateInfoByAdmin (userId: string, houseId: string, houseInfo: Partial<House>):
  Promise<HouseResponse> {
    const updatedHouse = await this.houseDataAccess.updateSystemInfo(userId, houseId, houseInfo);

    return this.houseDTO.houseResponse(updatedHouse);
  }

  /** Borra una casa del usuario. */
  async delete (userId: string, houseId: string): Promise<void> {
    await this.houseDataAccess.delete(userId, houseId);
  }

  /** Publica a Mosquitto mensaje de Encendido o Apagado de alarma según los parámetros. */
  async setAlarmState (userId: string, houseId: string, state: State, sensors?: SensorArmConfig[]):
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

    const excludedSensors = sensors?.reduce<number[]>((acum, sensor) => {
      if (sensor.estado !== State.ON) acum.push(sensor.numeroSensor);
      return acum;
    }, []).join(',');
    
    const message = `${state}:${excludedSensors ?? ''}`;

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
  async setTriggeredState (userId: string, houseId: string, sonando: boolean, numeroSensor?: number):
  Promise<void> {
    let username = '';
    let houseName = '';

    try {
      [username, houseName] = await this.getUsernameAndHouseName(userId, houseId);
    } catch (err: any) {
      console.log('Error al Disparar la Alarma: ', err.message);
      this.sendWarningById(userId, WarningType.TRIGGER_ALARM);
      return;
    }

    const message = `${sonando.toString()}:${numeroSensor ?? ''}`;

    this.mosquittoAccess.publicMessage(HouseAction.TRIGGER_ALARM, message, username, houseName);
  }

  /** Envía información `websockets` al usuario y carga datos en la `DB`. */
  async sendArmingInfo (username: string, info: AlarmArming): Promise<void> {
    const armingBase = process.env.WS_ALARM_ARMING ?? '';
    const triggerBase = process.env.WS_TRIGGER_ALARM ?? '';
    const armingEvent = `${armingBase}/${username}`;
    const triggeredEvent = `${triggerBase}/${username}`;

    this.webSocketAccess.emitSocketData<AlarmArming>(armingEvent, info);
    
    try {
      if (info.state === State.OFF) {
        const house = await this.houseDataAccess.getByHouseName(username, info.house);
        const wasRinging = house.central.sonando;
        
        if (wasRinging) {
          this.webSocketAccess.emitSocketData<TriggeredAlarm>(
            triggeredEvent, { house: info.house, ringing: false }
          );
        }
      }
      
      info.state === State.ON
        ? await this.houseDataAccess.updateAlarmState(username, info.house, info.excludedSensors)
        : await this.houseDataAccess.updateAlarmState(username, info.house);
    } catch (err: any) {
      console.log(`Error (method: "updateCentralState"): ${err.message as string}`);
    }
  }

  /** Publica información de iluminación a través de sockets para un usuario y casa específicos. */
  sendLightsInfo (username: string, info: Lights) {
    const base = process.env.WS_LIGHTS ?? '';
    const socketEvent = `${base}/${username}/${info.house}`;

    this.webSocketAccess.emitSocketData<Lights>(socketEvent, info);
  }

  /** Publica información de disparo a través de sockets y actualiza BD. */
  async sendTriggeredInfo (username: string, info: TriggeredAlarm): Promise<void> {
    const base = process.env.WS_TRIGGER_ALARM ?? '';
    const socketEvent = `${base}/${username}`;
    
    this.webSocketAccess.emitSocketData<TriggeredAlarm>(socketEvent, info);
    
    try {
      await this.centralDataAccess.updateSirenState(username, info.house, info.ringing);
      
      const sensorNumber = info.sensorNumber;
      if (sensorNumber) {
        const date = new Date(Date.now());
        await this.sensorDataAccess.addToHistory(username, info.house, sensorNumber, date);
        await this.centralDataAccess.addToHistory(username, info.house, sensorNumber, date);
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

    this.webSocketAccess.emitSocketData<Warning>(socketEvent, warning);
  }

  /** Envía warning a través de sockets al usuario por uesrId. */
  sendWarningById (userId: string, warningType: WarningType) {
    const base = process.env.WS_WARNING ?? '';
    const socketEvent = `${base}/${userId}`;
    const warning = WarningFactory.fromType(warningType);

    this.webSocketAccess.emitSocketData<Warning>(socketEvent, warning);
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

  /** Método privado que crea el nombre de la casa para operaciones de Mosquitto. */
  private createHouseName (name: string) {
    return name.toLowerCase().replace(/\s/g, '');
  }
}
