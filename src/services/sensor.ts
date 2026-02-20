import { CreateSensorDTO, Device, SensorSystemInfoDTO } from '../interfaces';
import { SensorDataAccess } from '../models';

/** Servicio que administra operaciones con la BD y lógica de negocio vinculada a Sensores. */
export class SensorService {
  constructor (private sensorDataAccess: SensorDataAccess) {}

  /** Crea un nuevo sensor para el usuario. */
  async create (userId: string, houseId: string, sensor: CreateSensorDTO): Promise<Partial<Device>> {
    return await this.sensorDataAccess.create(userId, houseId, sensor);
  }

  async getOne (userId: string, houseId: string, sensorNumber: number): Promise<Device> {
    return await this.sensorDataAccess.getOne(userId, houseId, sensorNumber);
  }

  async updateName (userId: string, houseId: string, sensorNumber: number, name: string):
  Promise<Device> {
    return await this.sensorDataAccess.updateName(userId, houseId, sensorNumber, name);
  }

  async updateInfo (
    userId: string, houseId: string, sensorNumber: number, sensorInfo: SensorSystemInfoDTO
  ): Promise<Device> {
    return await this.sensorDataAccess.updateInfo(userId, houseId, sensorNumber, sensorInfo);
  }

  async delete (userId: string, houseId: string, sensorNumber: number): Promise<void> {
    await this.sensorDataAccess.delete(userId, houseId, sensorNumber);
  }
}
