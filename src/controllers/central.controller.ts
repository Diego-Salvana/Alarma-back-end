import { Response } from 'express';
import { CentralService } from '../services';
import { RequestExt, SessionJwtPayload } from '../interfaces';
import { ErrorHandler } from '../utils';
import { requireUserIdAndHouseId } from '../utils/required-ids';

export class CentralController {
  constructor (private centralService: CentralService) {}

  async getHistory ({ user }: RequestExt, res: Response) {
    try {
      const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);

      const responseHistory = await this.centralService.getHistory(sub, hid);
      
      res.status(200).json({ message: 'Satisfactory request', data: { history: responseHistory } });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener la casa');
    }
  }

  async updateCode ({ params, user, body }: RequestExt, res: Response) {
    try {
      const { sub } = user as SessionJwtPayload;
      const { houseId } = params;

      await this.centralService.updateCode(sub, houseId, body);

      res.status(204).send();
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar casa');
    }
  }
}
