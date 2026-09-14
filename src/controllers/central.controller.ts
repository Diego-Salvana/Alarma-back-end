import { Response } from 'express';

import { CentralService } from '../services';
import { RequestExt, SessionJwtPayload } from '../interfaces';
import { requireUserIdAndHouseId, sendSuccess } from '../utils';

export class CentralController {
  constructor (private centralService: CentralService) {}

  async getHistory ({ user }: RequestExt, res: Response) {
    const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);
    const responseHistory = await this.centralService.getHistory(sub, hid);

    sendSuccess(res, 200, 'History retrieved successfully', { history: responseHistory });
  }

  async updateCode ({ params, user, body }: RequestExt, res: Response) {
    const { sub } = user as SessionJwtPayload;
    const { houseId } = params;

    await this.centralService.updateCode(sub, houseId, body);

    sendSuccess(res, 200, 'Central code updated successfully', null);
  }
}
