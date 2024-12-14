import { Dispositivo, JwtPayloadExt, SensorInfoDTO, SensorNameDTO } from '../interfaces';
import { SensorDataAccess } from '../schemas';
import { NotFound } from '../utils';

export class SensorService {
   constructor (private sensorDataAccess: SensorDataAccess) {}

   async create (userPayload: JwtPayloadExt, houseId: string, sensor: Dispositivo): Promise<Dispositivo> {
      const userId = userPayload.sub as string;

      const newSensor = await this.sensorDataAccess.create(userId, houseId, sensor);

      if (newSensor === null) throw new NotFound('Usuario o casa encontrado');

      return newSensor;
   }

   async getOne (userPayload: JwtPayloadExt, houseId: string, sensorNumber: number): Promise<Dispositivo> {
      const userId = userPayload.sub as string;

      const sensor = await this.sensorDataAccess.getOne(userId, houseId, sensorNumber);

      if (sensor === null) throw new NotFound('Sensor no encontrado');

      return sensor;
   }

   async updateName (userPayload: JwtPayloadExt, houseId: string, nameBody: SensorNameDTO): Promise<Dispositivo> {
      const userId = userPayload.sub as string;
      const { numeroSensor, nombre } = nameBody;

      const updatedSensor = await this.sensorDataAccess.updateName(userId, houseId, numeroSensor, nombre);

      return updatedSensor;
   }

   async updateInfo (userPayload: JwtPayloadExt, houseId: string, sensorNumber: number, infoBody: SensorInfoDTO): Promise<Dispositivo> {
      const userId = userPayload.sub as string;

      const updatedSensor = await this.sensorDataAccess.updateInfo(userId, houseId, sensorNumber, infoBody);

      return updatedSensor;
   }

   async delete (userPayload: JwtPayloadExt, houseId: string, sensorNumber: number): Promise<void> {
      const userId = userPayload.sub as string;

      await this.sensorDataAccess.delete(userId, houseId, sensorNumber);
   }
}
