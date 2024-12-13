import { Response } from 'express';
import { SensorDataAccess } from '../schemas';
import { SensorService } from '../services';
import { RequestExt } from '../interfaces';
import { checkPayload, ErrorHandler } from '../utils';

export class SensorController {
   private sensorService: SensorService;

   constructor (private sensorDataAccess: SensorDataAccess) {
      this.sensorService = new SensorService(sensorDataAccess);
   }

   // async create ({ body, userPayload }: RequestExt, res: Response) {
   //    try {
   //       const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');

   //       const responseHouse = await this.houseService.create(body, payload);
   //       res.status(201).json({ message: 'Created successfully', data: responseHouse });
   //    } catch (err: any) {
   //       ErrorHandler.generateResponse(res, err, 'Ocurrió un error al crear la casa');
   //    }
   // }

   // async getHouse ({ params, userPayload }: RequestExt, res: Response) {
   //    try {
   //       const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');
   //       const houseId = params.id;

   //       const responseHouse = await this.houseService.getOne(houseId, payload);
   //       res.status(200).json({ message: 'Satisfactory request', data: responseHouse });
   //    } catch (err: any) {
   //       ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener la casa');
   //    }
   // }

   // async update ({ params, body, userPayload }: RequestExt, res: Response) {
   //    try {
   //       const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');
   //       const houseId = params.id;

   //       const responseHouse = await this.houseService.update(houseId, payload, body);
   //       res.status(200).json({ message: 'Updated successfully', data: responseHouse });
   //    } catch (err: any) {
   //       ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar casa');
   //    }
   // }

   // async delete ({ params, userPayload }: RequestExt, res: Response) {
   //    try {
   //       const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');
   //       const houseId = params.id;

   //       await this.houseService.delete(houseId, payload);
   //       res.status(200).json({ message: 'Deleted successfully' });
   //    } catch (err: any) {
   //       ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar usuario');
   //    }
   // }
}
