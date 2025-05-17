import { Dispositivo, Estado, Historial, SensorInfoDTO, User } from '../interfaces';
import { AlreadyExists, NotFound } from '../utils';
import { UserModel } from './user';

export class SensorDataAccess {
   private userModel = UserModel;
   private noSensorsHistory = '-casas.sensores.historial -casas.camaras.historial';
   private noCentralHistory = '-casas.central.historial';

   async create (userId: string, houseId: string, sensor: Dispositivo): Promise<Dispositivo | null> {
      const user = await this.userModel.findOne(
         { _id: userId, 'casas._id': houseId, 'casas.sensores.numeroSensor': sensor.numeroSensor }
      ).lean();

      if (user !== null) throw new AlreadyExists(`Ya existe un sensor con el número ${sensor.numeroSensor}`);

      const userNewSensor: User | null = await this.userModel
         .findOneAndUpdate(
            { _id: userId, 'casas._id': houseId },
            { $push: { 'casas.$.sensores': sensor } },
            { new: true }
         )
         .select(`${this.noSensorsHistory} ${this.noCentralHistory}`)
         .lean();

      const house = userNewSensor?.casas.find(h => h._id.toString() === houseId);
      const newSensor = house?.sensores.find(s => s.numeroSensor === sensor.numeroSensor);

      return newSensor ?? null;
   }

   async getOne (userId: string, houseId: string, sensorNumber: number): Promise<Dispositivo | null> {
      const user = await this.userModel
         .findOne({ _id: userId, 'casas._id': houseId, 'casas.sensores.numeroSensor': sensorNumber })
         .select(this.noCentralHistory)
         .lean();

      const house = user?.casas.find(h => h._id.toString() === houseId);
      const sensor = house?.sensores.find(s => s.numeroSensor === sensorNumber);

      return sensor ?? null;
   }

   async updateName (userId: string, houseId: string, sensorNumber: number, name: string): Promise<Dispositivo> {
      const user = await this.userModel
         .findOne({ _id: userId, 'casas._id': houseId, 'casas.sensores.numeroSensor': sensorNumber })
         .select(`${this.noSensorsHistory} ${this.noCentralHistory}`);

      if (user === null) throw new NotFound('Usuario o sensor no encontrados');

      const house = user.casas.find(h => h._id.toString() === houseId);
      if (house === undefined) throw new NotFound('Casa no encontrada');

      const sensor = house.sensores.find(s => s.numeroSensor === sensorNumber);
      if (sensor === undefined) throw new NotFound('Sensor no encontrado');

      sensor.nombre = name;

      await user.save();

      return sensor;
   }

   async updateInfo (userId: string, houseId: string, sensorNumber: number, infoBody: SensorInfoDTO): Promise<Dispositivo> {
      const user = await this.userModel
         .findOne({ _id: userId, 'casas._id': houseId, 'casas.sensores.numeroSensor': sensorNumber })
         .select(`${this.noSensorsHistory} ${this.noCentralHistory}`);

      if (user === null) throw new NotFound('Sensor no encontrado');
      
      const house = user.casas.find(h => h._id.toString() === houseId);
      if (house === undefined) throw new NotFound('Casa no encontrada');

      const sensor = house.sensores.find(s => s.numeroSensor === sensorNumber);
      if (sensor === undefined) throw new NotFound('Sensor no encontrado');

      if (infoBody.dispositivoId !== undefined) sensor.dispositivoId = infoBody.dispositivoId;
      if (infoBody.numeroSensor !== undefined) sensor.numeroSensor = infoBody.numeroSensor;
      if (infoBody.tipo !== undefined) sensor.tipo = infoBody.tipo;

      await user.save();

      return sensor;
   }

   async delete (userId: string, houseId: string, sensorNumber: number): Promise<void> {
      const user = await this.userModel.findOneAndUpdate(
         { _id: userId, 'casas._id': houseId, 'casas.sensores.numeroSensor': sensorNumber },
         { $pull: { 'casas.$.sensores': { numeroSensor: sensorNumber } } },
         { new: true }
      );

      if (user === null) throw new NotFound('Sensor no encontrado');
   }

   async updateState (userName: string, houseName: string, sensorNumber: number, state: Estado): Promise<void> {
      const user = await this.userModel
         .findOne({ nombreUsuario: userName, 'casas.nombreCasa': houseName, 'casas.sensores.numeroSensor': sensorNumber })
         .select(`${this.noCentralHistory}`);

      if (user === null) throw new NotFound('Sensor no encontrado');

      const house = user.casas.find(h => h.nombreCasa === houseName);
      if (house === undefined) throw new NotFound('Casa no encontrada');

      const sensor = house.sensores.find(s => s.numeroSensor === sensorNumber);
      if (sensor === undefined) throw new NotFound('Sensor no encontrado');

      sensor.estado = state;

      await user.save();
   }

   async addActivationDate (userName: string, houseName: string, sensorNumber: number, date: Date): Promise<void> {
      const utcDate = new Date(date.toISOString());
      const activationDate: Historial = { fechaHora: utcDate };
            
      const user = await this.userModel
         .findOne({ nombreUsuario: userName, 'casas.nombreCasa': houseName, 'casas.sensores.numeroSensor': sensorNumber })
         .select(`${this.noCentralHistory}`);

      if (user === null) throw new NotFound('Sensor no encontrado');

      const house = user.casas.find(h => h.nombreCasa === houseName);
      if (house === undefined) throw new NotFound('Casa no encontrada');

      const sensor = house.sensores.find(s => s.numeroSensor === sensorNumber);
      if (sensor === undefined) throw new NotFound('Sensor no encontrado');

      sensor.historial.unshift(activationDate);

      await user.save();
   }
}
