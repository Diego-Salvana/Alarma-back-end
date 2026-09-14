import { CreateSensor, Device, EventLog, State } from '../../interfaces';
import { ConflictError, NotFoundError } from '../../errors';
import { UserModel } from '.';

export class SensorDataAccess {
  private userModel = UserModel;
  private noSensorsHistory = '-casas.sensores.historial -casas.camaras.historial';
  private noCentralHistory = '-casas.central.historial';
  
  /** Crea un nuevo sensor para el usuario, evitando números duplicados. */
  async create (userId: string, houseId: string, sensor: CreateSensor): Promise<Partial<Device>> {
    const user = await this.userModel
      .findOne(
        {
          _id: userId,
          'casas._id': houseId
        }
      )
      .select(`${this.noSensorsHistory} ${this.noCentralHistory}`);

    if (user === null) throw new NotFoundError('User or house not found');

    const house = user.casas.find(h => h._id.toString() === houseId);
    if (!house) throw new NotFoundError('House not found');
    
    const sensorExists = house.sensores.some(s => s.numeroSensor === sensor.numeroSensor);
    if (sensorExists) throw new ConflictError('Sensor number already exists');

    const newSensor: Device = { ...sensor, estado: State.ON, historial: [] };

    house.sensores.push(newSensor);
    await user.save();

    return {
      dispositivoId: newSensor.dispositivoId,
      nombre: newSensor.nombre,
      numeroSensor: newSensor.numeroSensor,
      tipo: newSensor.tipo
    };
  }

  /** Obtiene un Sensor de una Casa del Usuario. */
  async getOne (userId: string, houseId: string, sensorNumber: number): Promise<Device> {
    const user = await this.userModel
      .findOne(
        {
          _id: userId,
          'casas._id': houseId,
          'casas.sensores.numeroSensor': sensorNumber
        }
      )
      .select(this.noCentralHistory)
      .lean();

    if (user === null) throw new NotFoundError('Sensor or user not found');

    const house = user.casas.find(h => h._id.toString() === houseId);
    const sensor = house?.sensores.find(s => s.numeroSensor === sensorNumber);

    if (!sensor) throw new NotFoundError('Sensor not found');

    return sensor;
  }

  /** Actualiza el nombre de un Sensor de una Casa del Usuario. */
  async updateName (userId: string, houseId: string, sensorNumber: number, name: string):
  Promise<Device> {
    const user = await this.userModel
      .findOneAndUpdate(
        {
          _id: userId,
          'casas._id': houseId,
          'casas.sensores.numeroSensor': sensorNumber
        },
        {
          $set: { 'casas.$[casa].sensores.$[sensor].nombre': name }
        },
        {
          arrayFilters: [
            { 'casa._id': houseId },
            { 'sensor.numeroSensor': sensorNumber }
          ],
          new: true
        }
      )
      .select(this.noCentralHistory)
      .lean();

    if (user === null) throw new NotFoundError('User or sensor not found');

    const house = user.casas.find(h => h._id.toString() === houseId);
    const sensor = house?.sensores.find(s => s.numeroSensor === sensorNumber);
    
    if (!sensor) throw new NotFoundError('Sensor not found');

    return sensor;
  }

  /** Actualiza la información de un Sensor de una Casa del Usuario. */
  async updateInfo (
    userId: string, houseId: string, sensorNumber: number, infoBody: Partial<Device>
  ): Promise<Device> {
    const updateData: Record<string, any> = {};

    if (infoBody.dispositivoId) {
      updateData['casas.$[house].sensores.$[sensor].dispositivoId'] = infoBody.dispositivoId;
    }

    if (infoBody.numeroSensor) {
      updateData['casas.$[house].sensores.$[sensor].numeroSensor'] = infoBody.numeroSensor;
    }

    if (infoBody.tipo) {
      updateData['casas.$[house].sensores.$[sensor].tipo'] = infoBody.tipo;
    }

    const user = await this.userModel.findOneAndUpdate(
      {
        _id: userId,
        'casas._id': houseId,
        'casas.sensores.numeroSensor': sensorNumber
      },
      {
        $set: updateData
      },
      {
        new: true,
        arrayFilters: [
          { 'house._id': houseId },
          { 'sensor.numeroSensor': sensorNumber }
        ]
      }
    )
      .select(this.noCentralHistory)
      .lean();

    if (user === null) throw new NotFoundError('Sensor not found');

    const house = user.casas.find(h => h._id.toString() === houseId);
    const sensor = house?.sensores.find(s => s.numeroSensor === sensorNumber);

    if (!sensor) throw new NotFoundError('Sensor not found');

    return sensor;
  }

  /** Elimina un Sensor de una Casa del Usuario. */
  async delete (userId: string, houseId: string, sensorNumber: number): Promise<void> {
    const user = await this.userModel.findOneAndUpdate(
      {
        _id: userId,
        'casas._id': houseId,
        'casas.sensores.numeroSensor': sensorNumber
      },
      {
        $pull: { 'casas.$.sensores': { numeroSensor: sensorNumber } }
      }
    );

    if (user === null) throw new NotFoundError('Sensor or user not found');
  }

  /** Agrega una fecha de activación a un Sensor de una Casa del Usuario. */
  async addToHistory (userName: string, houseName: string, sensorNumber: number, date: Date):
  Promise<void> {
    const utcDate = new Date(date.toISOString());
    const activationDate: EventLog = { fechaHora: utcDate };

    const result = await this.userModel.updateOne(
      {
        nombreUsuario: userName,
        'casas.nombreCasa': houseName,
        'casas.sensores.numeroSensor': sensorNumber
      },
      {
        $push: {
          'casas.$[casa].sensores.$[sensor].historial': {
            $each: [activationDate],
            $position: 0,
            $slice: 1000
          }
        }
      },
      {
        arrayFilters: [
          { 'casa.nombreCasa': houseName },
          { 'sensor.numeroSensor': sensorNumber }
        ]
      }
    );

    if (result.matchedCount === 0) throw new NotFoundError('Sensor or user not found');
  }
}
