import { CreateSensorDTO, SensorResponse, SensorSystemInfoDTO } from '../interfaces';
import { EventDataAccess, SensorDataAccess } from '../database/access/mongodb';

export class SensorService {
  constructor (
    private sensorDataAccess: SensorDataAccess,
    private eventDataAccess: EventDataAccess
  ) {}

  async create (
    userId: string,
    houseId: string,
    sensor: CreateSensorDTO
  ): Promise<Partial<SensorResponse>> {
    return await this.sensorDataAccess.create(userId, houseId, sensor);
  }

  async getOne (
    userId: string,
    houseId: string,
    sensorNumber: number,
    withHistory = false
  ): Promise<SensorResponse> {
    const sensor = await this.sensorDataAccess.getOne(userId, houseId, sensorNumber);
    const response: SensorResponse = {
      model: sensor.model,
      number: sensor.number,
      name: sensor.name,
      type: sensor.type,
      state: sensor.state
    };

    if (withHistory) {
      response.history = (await this.eventDataAccess.getByHouseAndSensor(houseId, sensorNumber))
        .map(event => ({ date: event.date }));
    }

    return response;
  }

  async updateName (
    userId: string,
    houseId: string,
    sensorNumber: number,
    name: string
  ): Promise<SensorResponse> {
    const sensor = await this.sensorDataAccess.updateName(userId, houseId, sensorNumber, name);

    return {
      model: sensor.model,
      number: sensor.number,
      name: sensor.name,
      type: sensor.type,
      state: sensor.state
    };
  }

  async updateInfo (
    userId: string,
    houseId: string,
    sensorNumber: number,
    sensorInfo: SensorSystemInfoDTO
  ): Promise<SensorResponse> {
    const sensor = await this.sensorDataAccess.updateInfo(userId, houseId, sensorNumber, sensorInfo);

    return {
      model: sensor.model,
      number: sensor.number,
      name: sensor.name,
      type: sensor.type,
      state: sensor.state
    };
  }

  async delete (userId: string, houseId: string, sensorNumber: number): Promise<void> {
    await this.sensorDataAccess.delete(userId, houseId, sensorNumber);
  }
}
