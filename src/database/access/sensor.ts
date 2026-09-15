import { CreateSensor, Sensor, State } from '../../interfaces';
import { ConflictError, NotFoundError } from '../../errors';
import { HouseModel, LeanHouse } from '../models/house.model';

export class SensorDataAccess {
  private houseModel = HouseModel;

  async create (userId: string, houseId: string, sensor: CreateSensor): Promise<Partial<Sensor>> {
    const house = await this.houseModel.findOne({ _id: houseId, userId });
    if (house === null) throw new NotFoundError('User or house not found');

    const sensorExists = house.sensors.some(s => s.number === sensor.number);
    if (sensorExists) throw new ConflictError('Sensor number already exists');

    const newSensor = { ...sensor, state: State.ON };

    house.sensors.push(newSensor as never);
    await house.save();

    return {
      model: newSensor.model,
      name: newSensor.name,
      number: newSensor.number,
      type: newSensor.type
    };
  }

  async getOne (userId: string, houseId: string, sensorNumber: number): Promise<Sensor> {
    const house = await this.houseModel
      .findOne({ _id: houseId, userId })
      .lean<LeanHouse>();
    if (house === null) throw new NotFoundError('Sensor or user not found');

    const sensor = house.sensors.find(s => s.number === sensorNumber);
    if (!sensor) throw new NotFoundError('Sensor not found');

    return this.toDomain(sensor);
  }

  async updateName (userId: string, houseId: string, sensorNumber: number, name: string): Promise<Sensor> {
    const house = await this.houseModel.findOne({ _id: houseId, userId });
    if (house === null) throw new NotFoundError('User or sensor not found');

    const sensor = house.sensors.find(s => s.number === sensorNumber);
    if (!sensor) throw new NotFoundError('Sensor not found');

    sensor.name = name;
    await house.save();

    return this.toDomain(sensor);
  }

  /** Actualiza la información de sistema de un sensor por un Administrador. */
  async updateInfo (
    userId: string,
    houseId: string,
    sensorNumber: number,
    infoBody: Partial<Sensor>
  ): Promise<Sensor> {
    const house = await this.houseModel.findOne({ _id: houseId, userId });
    if (house === null) throw new NotFoundError('Sensor not found');

    const sensor = house.sensors.find(s => s.number === sensorNumber);
    if (!sensor) throw new NotFoundError('Sensor not found');

    if (infoBody.model) sensor.model = infoBody.model;

    if (infoBody.number !== undefined) {
      const duplicate = house.sensors.some(s => s.number === infoBody.number && s.number !== sensorNumber);
      if (duplicate) throw new ConflictError('Sensor number already exists');
      sensor.number = infoBody.number;
    }

    if (infoBody.type) sensor.type = infoBody.type;

    await house.save();

    return this.toDomain(sensor);
  }

  async delete (userId: string, houseId: string, sensorNumber: number): Promise<void> {
    const result = await this.houseModel.updateOne(
      { _id: houseId, userId },
      { $pull: { sensors: { number: sensorNumber } } }
    );

    if (result.matchedCount === 0) throw new NotFoundError('Sensor or user not found');
  }

  private toDomain (sensor: Sensor): Sensor {
    return {
      model: sensor.model,
      number: sensor.number,
      name: sensor.name,
      type: sensor.type,
      state: sensor.state
    };
  }
}
