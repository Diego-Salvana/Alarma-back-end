import { Response } from 'express';

import { SensorService } from '../services';
import { RequestExt, SessionJwtPayload } from '../interfaces';
import { ValidationError } from '../errors';
import { requireUserIdAndHouseId, sendSuccess } from '../utils';

export class SensorController {
  constructor (private sensorService: SensorService) {}

  async getOne ({ user, params }: RequestExt, res: Response) {
    const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);
    const sensorNumber = Number(params.sensorNumber);

    if (isNaN(sensorNumber)) throw new ValidationError('Invalid sensor number');

    const responseSensor = await this.sensorService.getOne(sub, hid, sensorNumber);

    sendSuccess(res, 200, 'Sensor retrieved successfully', responseSensor);
  }

  async updateName ({ user, body }: RequestExt, res: Response) {
    const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);
    const { number, name } = body;
    const responseSensor = await this.sensorService.updateName(sub, hid, number, name);

    sendSuccess(res, 200, 'Sensor updated successfully', responseSensor);
  }
}
