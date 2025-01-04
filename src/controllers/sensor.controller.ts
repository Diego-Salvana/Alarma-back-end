import { Response } from 'express';
import { SensorDataAccess } from '../schemas';
import { SensorService } from '../services';
import { RequestExt } from '../interfaces';
import { BadRequest, checkPayload, ErrorHandler } from '../utils';

export class SensorController {
   private sensorService: SensorService;

   constructor (sensorDataAccess: SensorDataAccess) {
      this.sensorService = new SensorService(sensorDataAccess);
   }

   async create ({ userPayload, params, body }: RequestExt, res: Response) {
      try {
         const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');
         const houseId = params.houseId;

         const responseSensor = await this.sensorService.create(payload, houseId, body);
         res.status(201).json({ message: 'Created successfully', data: responseSensor });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al crear el sensor');
      }
   }

   async getOne ({ userPayload, params }: RequestExt, res: Response) {
      try {
         const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');
         const houseId = params.houseId;
         const sensorNumber = Number(params.sensorNumber);

         if (isNaN(sensorNumber)) throw new BadRequest('Número de sensor no valido');

         const responseSensor = await this.sensorService.getOne(payload, houseId, sensorNumber);
         res.status(200).json({ message: 'Satisfactory request', data: responseSensor });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener la casa');
      }
   }

   async updateName ({ userPayload, params, body }: RequestExt, res: Response) {
      try {
         const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');
         const houseId = params.houseId;

         const responseSensor = await this.sensorService.updateName(payload, houseId, body);
         res.status(200).json({ message: 'Updated successfully', data: responseSensor });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar casa');
      }
   }

   async updateInfo ({ userPayload, params, body }: RequestExt, res: Response) {
      try {
         const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');
         const houseId = params.houseId;
         const sensorNumber = Number(params.sensorNumber);

         if (isNaN(sensorNumber)) throw new BadRequest('Número de sensor no valido');

         const responseSensor = await this.sensorService.updateInfo(payload, houseId, sensorNumber, body);
         res.status(200).json({ message: 'Updated successfully', data: responseSensor });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar casa');
      }
   }

   async delete ({ userPayload, params }: RequestExt, res: Response) {
      try {
         const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');
         const houseId = params.houseId;
         const sensorNumber = Number(params.sensorNumber);

         if (isNaN(sensorNumber)) throw new BadRequest('Número de sensor no valido');

         await this.sensorService.delete(payload, houseId, sensorNumber);
         res.status(200).json({ message: 'Deleted successfully' });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar usuario');
      }
   }
}
