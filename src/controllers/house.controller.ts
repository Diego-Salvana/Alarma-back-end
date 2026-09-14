import { Response } from 'express';

import { HouseService } from '../services';
import { State, RequestExt, SessionJwtPayload, ArmConfigurationDTO } from '../interfaces';
import { requireUserIdAndHouseId, sendSuccess } from '../utils';

export class HouseController {
  constructor (private houseService: HouseService) {}

  async getAll ({ user }: RequestExt, res: Response) {
    const { sub } = user as SessionJwtPayload;
    const responseHouse = await this.houseService.getAll(sub);

    sendSuccess(res, 200, 'Houses retrieved successfully', responseHouse);
  }

  async getOne ({ params, user, headers }: RequestExt, res: Response) {
    const { sub, verified } = user as SessionJwtPayload;
    const houseId = params.id;
    const tokenRequired = headers['set-house'] === 'true';
    const responseHouse = await this.houseService.getOne(sub, houseId, verified, tokenRequired);

    sendSuccess(res, 200, 'House retrieved successfully', responseHouse);
  }

  async getCurrent ({ user }: RequestExt, res: Response) {
    const payload = user as SessionJwtPayload;
    const { sub, hid } = requireUserIdAndHouseId(payload);
    const { verified } = payload;
    const responseHouse = await this.houseService.getOne(sub, hid, verified, false);

    sendSuccess(res, 200, 'House retrieved successfully', responseHouse);
  }

  async update ({ params, body, user }: RequestExt, res: Response) {
    const { sub } = user as SessionJwtPayload;
    const houseId = params.id;
    const responseHouse = await this.houseService.update(sub, houseId, body);

    sendSuccess(res, 200, 'House updated successfully', responseHouse);
  }

  async armAlarm ({ body, user }: RequestExt, res: Response) {
    const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);
    const { sensors } = body as ArmConfigurationDTO;

    sendSuccess(res, 202, 'Alarm arming initiated', { status: 'pending' });

    void this.houseService.setAlarmState(sub, hid, State.ON, sensors);
  }

  async disarmAlarm ({ user }: RequestExt, res: Response) {
    const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);

    sendSuccess(res, 202, 'Alarm disarming initiated', { status: 'pending' });

    void this.houseService.setAlarmState(sub, hid, State.OFF);
  }

  async setLights ({ body, user }: RequestExt, res: Response) {
    const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);

    sendSuccess(res, 202, 'Lights state update initiated', { status: 'pending' });

    void this.houseService.setLightsState(sub, hid, body);
  }

  async triggerAlarm ({ body, user }: RequestExt, res: Response) {
    const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);
    const { sonando, numeroSensor } = body;

    sendSuccess(res, 202, 'Alarm trigger initiated', { status: 'pending' });

    void this.houseService.setTriggeredState(sub, hid, sonando, numeroSensor);
  }
}
