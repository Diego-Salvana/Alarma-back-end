import { Response } from 'express';
import { CentralService } from '../services';
import { RequestExt } from '../interfaces';
import { checkUserPayload, ErrorHandler } from '../utils';

export class CentralController {
  constructor (private centralService: CentralService) {}

  async getHistory ({ user }: RequestExt, res: Response) {
    try {
      const payload = checkUserPayload(user, 'Falta información para encontrar usuario');

      const responseHistory = await this.centralService.getHistory(payload);
      res.status(200).json({ message: 'Satisfactory request', data: responseHistory });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener la casa');
    }
  }

  async updateCode ({ user, body }: RequestExt, res: Response) {
    try {
      const payload = checkUserPayload(user, 'Falta información para encontrar usuario');

      await this.centralService.updateCode(payload, body);
      res.status(200).json({ message: 'Updated successfully' });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar casa');
    }
  }
}
