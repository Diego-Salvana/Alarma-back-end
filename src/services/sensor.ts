import { Dispositivo, JwtPayloadExt, SensorInfoDTO, SensorNameDTO } from '../interfaces';
import { SensorDataAccess } from '../schemas';
import { NotFound } from '../utils';

/** Servicio que administra operaciones con la BD y lógica de negocio vinculada a Sensores. */
export class SensorService {
  constructor (private sensorDataAccess: SensorDataAccess) {}

  /** Crea un nuevo sensor para el usuario. */
  async create (userPayload: JwtPayloadExt, sensor: Dispositivo): Promise<Dispositivo> {
    const userId = userPayload.sub;
    const houseId = userPayload.hid;

    const newSensor = await this.sensorDataAccess.create(userId, houseId, sensor);

    if (newSensor === null) throw new NotFound('No se pudo crear el sensor, usuario o casa no encontrados.');

    return newSensor;
  }

  async getOne (userPayload: JwtPayloadExt, sensorNumber: number): Promise<Dispositivo> {
    const userId = userPayload.sub;
    const houseId = userPayload.hid;

    const sensor = await this.sensorDataAccess.getOne(userId, houseId, sensorNumber);

    if (sensor === null) throw new NotFound('Sensor no encontrado');

    return sensor;
  }

  async updateName (userPayload: JwtPayloadExt, nameBody: SensorNameDTO): Promise<Dispositivo> {
    const userId = userPayload.sub;
    const houseId = userPayload.hid;
    const { numeroSensor, nombre } = nameBody;

    const updatedSensor = await this.sensorDataAccess.updateName(userId, houseId, numeroSensor, nombre);

    return updatedSensor;
  }

  // TODO: modificar para recibir ids por parametro
  async updateInfo (userPayload: JwtPayloadExt, sensorNumber: number, infoBody: SensorInfoDTO): Promise<Dispositivo> {
    const userId = userPayload.sub;
    const houseId = userPayload.hid;

    const updatedSensor = await this.sensorDataAccess.updateInfo(userId, houseId, sensorNumber, infoBody);

    return updatedSensor;
  }

  async delete (userPayload: JwtPayloadExt, sensorNumber: number): Promise<void> {
    const userId = userPayload.sub;
    const houseId = userPayload.hid;

    await this.sensorDataAccess.delete(userId, houseId, sensorNumber);
  }
}
