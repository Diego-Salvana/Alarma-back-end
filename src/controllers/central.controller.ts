import { Response } from 'express';
import { CentralDataAccess } from '../schemas';
import { CentralService } from '../services';
import { RequestExt } from '../interfaces';
import { checkPayload, ErrorHandler } from '../utils';

export class CentralController {
   private centralService: CentralService;

   constructor (centralDataAccess: CentralDataAccess) {
      this.centralService = new CentralService(centralDataAccess);
   }

   async getHistory ({ userPayload }: RequestExt, res: Response) {
      try {
         const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');

         const responseCentral = await this.centralService.getHistory(payload);
         res.status(200).json({ message: 'Satisfactory request', data: responseCentral });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener la casa');
      }
   }

   async updateCode ({ userPayload, body }: RequestExt, res: Response) {
      try {
         const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');

         await this.centralService.updateCode(payload, body);
         res.status(200).json({ message: 'Updated successfully' });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar casa');
      }
   }

   async updateInfo ({ userPayload, params, body }: RequestExt, res: Response) {
      try {
         const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');
         const houseId = params.houseId;

         const responseCentral = await this.centralService.updateInfo(payload, houseId, body);
         res.status(200).json({ message: 'Updated successfully', data: responseCentral });
      } catch (err: any) {
         ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar casa');
      }
   }
}
