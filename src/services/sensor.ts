import { CreateSensorDTO, DeviceResponse, SensorSystemInfoDTO } from '../interfaces';
import { SensorDataAccess } from '../database/access/mongodb';

export class SensorService {
  constructor (private sensorDataAccess: SensorDataAccess) {}

  async create (
    userId: string,
    houseId: string,
    sensor: CreateSensorDTO
  ): Promise<Partial<DeviceResponse>> {
    return await this.sensorDataAccess.create(userId, houseId, sensor);
  }

  async getOne (userId: string, houseId: string, sensorNumber: number): Promise<DeviceResponse> {
    const sensor = await this.sensorDataAccess.getOne(userId, houseId, sensorNumber);

    return { model: sensor.model, number: sensor.number, name: sensor.name, type: sensor.type, state: sensor.state };
  }

  async updateName (
    userId: string,
    houseId: string,
    sensorNumber: number,
    name: string
  ): Promise<DeviceResponse> {
    const sensor = await this.sensorDataAccess.updateName(userId, houseId, sensorNumber, name);

    return { model: sensor.model, number: sensor.number, name: sensor.name, type: sensor.type, state: sensor.state };
  }

  async updateInfo (
    userId: string, houseId: string, sensorNumber: number, sensorInfo: SensorSystemInfoDTO
  ): Promise<DeviceResponse> {
    const sensor = await this.sensorDataAccess.updateInfo(userId, houseId, sensorNumber, sensorInfo);

    return { model: sensor.model, number: sensor.number, name: sensor.name, type: sensor.type, state: sensor.state };
  }

  async delete (userId: string, houseId: string, sensorNumber: number): Promise<void> {
    await this.sensorDataAccess.delete(userId, houseId, sensorNumber);
  }
}
