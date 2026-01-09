import { Dispositivo, Historial, SensorInfoDTO } from '../interfaces';
import { AlreadyExists, NotFound } from '../utils';
import { UserModel } from '.';

/** Provee acceso a la base de datos para operaciones con Sensores. */
export class SensorDataAccess {
  private userModel = UserModel;
  private noSensorsHistory = '-casas.sensores.historial -casas.camaras.historial';
  private noCentralHistory = '-casas.central.historial';
  
  /** Crea un nuevo sensor para el usuario, evitando números duplicados. */
  async create (userId: string, houseId: string, sensor: Dispositivo): Promise<Dispositivo> {
    const user = await this.userModel
      .findOneAndUpdate(
        {
          _id: userId,
          'casas._id': houseId,
          'casas.sensores': { $not: { $elemMatch: { numeroSensor: sensor.numeroSensor } } }
        },
        {
          $push: { 'casas.$.sensores': sensor }
        },
        { new: true }
      )
      .select(`${this.noSensorsHistory} ${this.noCentralHistory}`)
      .lean();

    if (user === null) throw new AlreadyExists(`El sensor ${sensor.numeroSensor} ya existe o la casa no fue encontrada`);

    const house = user.casas.find(h => h._id.toString() === houseId);
    if (!house) throw new NotFound('Casa no encontrada');
    
    const newSensor = house.sensores.find(s => s.numeroSensor === sensor.numeroSensor);
    if (!newSensor) throw new NotFound('Sensor no encontrado');

    return newSensor;
  }

  /** Obtiene un Sensor de una Casa del Usuario. */
  async getOne (userId: string, houseId: string, sensorNumber: number): Promise<Dispositivo> {
    const user = await this.userModel
      .findOne({ _id: userId, 'casas._id': houseId, 'casas.sensores.numeroSensor': sensorNumber })
      .select(this.noCentralHistory)
      .lean();

    if (user === null) throw new NotFound('Sensor o usuario no encontrados');

    const house = user.casas.find(h => h._id.toString() === houseId);
    if (!house) throw new NotFound('Casa no encontrada');

    const sensor = house.sensores.find(s => s.numeroSensor === sensorNumber);
    if (!sensor) throw new NotFound('Sensor no encontrado');

    return sensor;
  }

  /** Actualiza el nombre de un Sensor de una Casa del Usuario. */
  async updateName (userId: string, houseId: string, sensorNumber: number, name: string):
  Promise<Dispositivo> {
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

    if (user === null) throw new NotFound('Usuario o sensor no encontrados');

    const house = user.casas.find(h => h._id.toString() === houseId);
    if (!house) throw new NotFound('Casa no encontrada');

    const sensor = house.sensores.find(s => s.numeroSensor === sensorNumber);
    if (!sensor) throw new NotFound('Sensor no encontrado');

    return sensor;
  }

  /** Actualiza la información de un Sensor de una Casa del Usuario. */
  async updateInfo (userId: string, houseId: string, sensorNumber: number, infoBody: SensorInfoDTO):
  Promise<Dispositivo> {
    const user = await this.userModel
      .findOne({ _id: userId, 'casas._id': houseId, 'casas.sensores.numeroSensor': sensorNumber })
      .select(`${this.noSensorsHistory} ${this.noCentralHistory}`);

    if (user === null) throw new NotFound('Sensor no encontrado');
      
    const house = user.casas.find(h => h._id.toString() === houseId);
    if (!house) throw new NotFound('Casa no encontrada');

    const sensor = house.sensores.find(s => s.numeroSensor === sensorNumber);
    if (!sensor) throw new NotFound('Sensor no encontrado');

    sensor.dispositivoId = infoBody.dispositivoId;
    sensor.numeroSensor = infoBody.numeroSensor;
    sensor.tipo = infoBody.tipo;

    await user.save();

    return sensor;
  }

  /** Elimina un Sensor de una Casa del Usuario. */
  async delete (userId: string, houseId: string, sensorNumber: number): Promise<void> {
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, 'casas._id': houseId, 'casas.sensores.numeroSensor': sensorNumber },
      { $pull: { 'casas.$.sensores': { numeroSensor: sensorNumber } } }
    );

    if (user === null) throw new NotFound('Sensor o usuario no encontrados');
  }

  /** Agrega una fecha de activación a un Sensor de una Casa del Usuario. */
  async addToHistory (userName: string, houseName: string, sensorNumber: number, date: Date):
  Promise<void> {
    const utcDate = new Date(date.toISOString());
    const activationDate: Historial = { fechaHora: utcDate };

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
            $slice: 100
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

    if (result.matchedCount === 0) throw new NotFound('Sensor o usuario no encontrados');
  }
}
