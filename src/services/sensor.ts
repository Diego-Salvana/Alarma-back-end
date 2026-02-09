import { Dispositivo, SensorInfoDTO, SensorNameDTO } from '../interfaces';
import { SensorDataAccess } from '../models';

/** Servicio que administra operaciones con la BD y lógica de negocio vinculada a Sensores. */
export class SensorService {
  constructor (private sensorDataAccess: SensorDataAccess) {}

  /** Crea un nuevo sensor para el usuario. */
  async create (userId: string, houseId: string, sensor: Dispositivo): Promise<Dispositivo> {
    const newSensor = await this.sensorDataAccess.create(userId, houseId, sensor);

    return newSensor;
  }

  async getOne (userId: string, houseId: string, sensorNumber: number): Promise<Dispositivo> {
    const sensor = await this.sensorDataAccess.getOne(userId, houseId, sensorNumber);

    return sensor;
  }

  async updateName (userId: string, houseId: string, nameBody: SensorNameDTO): Promise<Dispositivo> {
    const { numeroSensor, nombre } = nameBody;

    const updatedSensor = await this.sensorDataAccess.updateName(
      userId, houseId, numeroSensor, nombre
    );

    return updatedSensor;
  }

  async updateInfo (userId: string, houseId: string, sensorNumber: number, infoBody: SensorInfoDTO):
  Promise<Dispositivo> {
    const updatedSensor = await this.sensorDataAccess.updateInfo(
      userId, houseId, sensorNumber, infoBody
    );

    return updatedSensor;
  }

  async delete (userId: string, houseId: string, sensorNumber: number): Promise<void> {
    await this.sensorDataAccess.delete(userId, houseId, sensorNumber);
  }
}
