import { Response } from 'express';
import { HouseService } from '../services';
import { Estado, ExclusionSensor, RequestExt } from '../interfaces';
import { BadRequest, checkUserPayload, ErrorHandler } from '../utils';

/** Gestiona peticiones y respuestas vinculadas a Casas. */
export class HouseController {
  constructor (private houseService: HouseService) {}

  async getAll ({ user }: RequestExt, res: Response) {
    try {
      const payload = checkUserPayload(user, 'Falta información para encontrar usuario');
      const responseHouse = await this.houseService.getAll(payload);

      res.status(200).json({ message: 'Satisfactory request', data: responseHouse });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener la casa');
    }
  }

  async getOne ({ params, user, headers }: RequestExt, res: Response) {
    try {
      const payload = checkUserPayload(user, 'Falta información para encontrar usuario');
      const houseId = params.id;
      const responseHouse = await this.houseService.getOne(houseId, payload, headers);

      res.status(200).json({ message: 'Satisfactory request', data: responseHouse });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener la casa');
    }
  }

  async update ({ params, body, user }: RequestExt, res: Response) {
    try {
      const payload = checkUserPayload(user, 'Falta información para encontrar usuario');
      const houseId = params.id;
      const responseHouse = await this.houseService.update(houseId, payload, body);

      res.status(200).json({ message: 'Updated successfully', data: responseHouse });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar casa');
    }
  }

  async armAlarm ({ body, user }: RequestExt, res: Response) {
    try {
      const payload = checkUserPayload(user, 'Falta información para encontrar usuario');
      const someActivated = body.exclusionArray.some(
        (sensor: ExclusionSensor) => sensor.estado === Estado.ENCENDIDO
      );
      
      if (!someActivated) throw new BadRequest('No hay sensores encendidos');
      
      // Responde inmediatamente que la solicitud fue aceptada para su procesamiento.
      res.status(202).json({ message: 'Activation in process', status: 'pending' });
      
      // Inicia el proceso de activación de la alarma en segundo plano.
      void this.houseService.setAlarmState(payload, Estado.ENCENDIDO, body);
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al activar la alarma');
    }
  }

  async disarmAlarm ({ user }: RequestExt, res: Response) {
    try {
      const payload = checkUserPayload(user, 'Falta información para encontrar usuario');

      res.status(202).json({ message: 'Deactivation in process', status: 'pending' });

      void this.houseService.setAlarmState(payload, Estado.APAGADO);
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al desactivar la alarma');
    }
  }

  async setLights ({ body, user }: RequestExt, res: Response) {
    try {
      const payload = checkUserPayload(user, 'Falta información para encontrar usuario');

      res.status(202).json({ message: 'Set lights state in process', status: 'pending' });

      void this.houseService.setLightsState(payload, body);
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al desactivar la alarma');
    }
  }

  async triggerAlarm ({ body, user }: RequestExt, res: Response) {
    try {
      const payload = checkUserPayload(user, 'Falta información para encontrar usuario');

      res.status(202).json({ message: 'Trigger in process', status: 'pending' });

      void this.houseService.setTriggeredState(payload, body.state);
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al disparar la alarma');
    }
  }
}
