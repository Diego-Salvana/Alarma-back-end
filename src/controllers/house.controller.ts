import { Response } from 'express';
import { HouseService } from '../services';
import { State, RequestExt, SessionJwtPayload } from '../interfaces';
import { ErrorHandler, requireUserIdAndHouseId } from '../utils';

/** Gestiona peticiones y respuestas vinculadas a Casas. */
export class HouseController {
  constructor (private houseService: HouseService) {}

  async getAll ({ user }: RequestExt, res: Response) {
    try {
      const { sub } = user as SessionJwtPayload;
      const responseHouse = await this.houseService.getAll(sub);

      res.status(200).json({ message: 'Satisfactory request', data: responseHouse });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener la casa');
    }
  }

  async getOne ({ params, user, headers }: RequestExt, res: Response) {
    try {
      const { sub, verified } = user as SessionJwtPayload;
      const houseId = params.id;
      const tokenRequired = headers['set-house'] === 'true';
      const responseHouse = await this.houseService.getOne(sub, houseId, verified, tokenRequired);

      res.status(200).json({ message: 'Satisfactory request', data: responseHouse });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener la casa');
    }
  }

  async update ({ params, body, user }: RequestExt, res: Response) {
    try {
      const { sub } = user as SessionJwtPayload;
      const houseId = params.id;
      const responseHouse = await this.houseService.update(sub, houseId, body);

      res.status(200).json({ message: 'Updated successfully', data: responseHouse });
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar casa');
    }
  }

  async armAlarm ({ body, user }: RequestExt, res: Response) {
    try {
      const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);
      
      this.houseService.validateArmAlarm(body);
      
      // Responde inmediatamente que la solicitud fue aceptada para su procesamiento.
      res.status(202).json({ message: 'Activation in process', status: 'pending' });
      
      // Inicia el proceso de activación de la alarma en segundo plano.
      void this.houseService.setAlarmState(sub, hid, State.ON, body);
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al activar la alarma');
    }
  }

  async disarmAlarm ({ user }: RequestExt, res: Response) {
    try {
      const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);

      res.status(202).json({ message: 'Deactivation in process', status: 'pending' });

      void this.houseService.setAlarmState(sub, hid, State.OFF);
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al desactivar la alarma');
    }
  }

  async setLights ({ body, user }: RequestExt, res: Response) {
    try {
      const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);

      res.status(202).json({ message: 'Set lights state in process', status: 'pending' });

      void this.houseService.setLightsState(sub, hid, body);
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al desactivar la alarma');
    }
  }

  async triggerAlarm ({ body, user }: RequestExt, res: Response) {
    try {
      const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);
      const { sonando, numeroSensor } = body;

      res.status(202).json({ message: 'Trigger in process', status: 'pending' });

      void this.houseService.setTriggeredState(sub, hid, sonando, numeroSensor);
    } catch (err) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al disparar la alarma');
    }
  }
}
