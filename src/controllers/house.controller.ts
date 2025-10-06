import { Response } from 'express';
import { HouseDataAccess, UserDataAccess } from '../schemas';
import { HouseService } from '../services';
import { Estado, ExclusionSensor, RequestExt } from '../interfaces';
import { BadRequest, checkPayload, ErrorHandler } from '../utils';
import { MosquittoAccess } from '../mqtt';

export class HouseController {
  private houseService: HouseService;
	
  constructor (
    houseDataAccess: HouseDataAccess,
    mosquittoAcces: MosquittoAccess,
    userDataAccess: UserDataAccess
  ) {
    this.houseService = new HouseService(
      houseDataAccess,
      mosquittoAcces,
      userDataAccess
    );
  }

  async create ({ body, userPayload }: RequestExt, res: Response) {
    try {
      const payload = checkPayload(userPayload, 'Falta información para encontrar usuario');

      await this.houseService.create(body, payload);
      res.status(201).json({ message: 'Created successfully' });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al crear la casa');
    }
  }

  async getAll ({ userPayload }: RequestExt, res: Response) {
    try {
      const payload = checkPayload(
        userPayload,
        'Falta información para encontrar usuario'
      );

      const responseHouse = await this.houseService.getAll(payload);
      res
        .status(200)
        .json({ message: 'Satisfactory request', data: responseHouse });
    } catch (err: any) {
      ErrorHandler.generateResponse(
        res,
        err,
        'Ocurrió un error al obtener la casa'
      );
    }
  }

  async getHouse ({ params, userPayload, headers }: RequestExt, res: Response) {
    try {
      const payload = checkPayload(
        userPayload,
        'Falta información para encontrar usuario'
      );
      const houseId = params.id;

      const responseHouse = await this.houseService.getOne(
        houseId,
        payload,
        headers
      );
      res
        .status(200)
        .json({ message: 'Satisfactory request', data: responseHouse });
    } catch (err: any) {
      ErrorHandler.generateResponse(
        res,
        err,
        'Ocurrió un error al obtener la casa'
      );
    }
  }

  async update ({ params, body, userPayload }: RequestExt, res: Response) {
    try {
      const payload = checkPayload(
        userPayload,
        'Falta información para encontrar usuario'
      );
      const houseId = params.id;

      const responseHouse = await this.houseService.update(
        houseId,
        payload,
        body
      );
      res
        .status(200)
        .json({ message: 'Updated successfully', data: responseHouse });
    } catch (err: any) {
      ErrorHandler.generateResponse(
        res,
        err,
        'Ocurrió un error al actualizar casa'
      );
    }
  }

  async delete ({ params, userPayload }: RequestExt, res: Response) {
    try {
      const payload = checkPayload(
        userPayload,
        'Falta información para encontrar usuario'
      );
      const houseId = params.id;

      await this.houseService.delete(houseId, payload);
      res.status(200).json({ message: 'Deleted successfully' });
    } catch (err: any) {
      ErrorHandler.generateResponse(
        res,
        err,
        'Ocurrió un error al actualizar usuario'
      );
    }
  }

  async activeAlarm ({ body, userPayload }: RequestExt, res: Response) {
    try {
      const payload = checkPayload(
        userPayload,
        'Falta información para encontrar usuario'
      );
      const someActivated = body.exclusionArray.some(
        (sensor: ExclusionSensor) => sensor.estado === Estado.ENCENDIDO
      );

      if (!someActivated) throw new BadRequest('No hay sensores encendidos');

      // Responde inmediatamente que la solicitud fue aceptada para su procesamiento.
      res
        .status(202)
        .json({ message: 'Activation in process', state: 'pending' });

      // Inicia el proceso de activación de la alarma en segundo plano.
      void this.houseService.setAlarmState(payload, Estado.ENCENDIDO, body);
    } catch (err: any) {
      ErrorHandler.generateResponse(
        res,
        err,
        'Ocurrió un error al activar la alarma'
      );
    }
  }

  async disarmAlarm ({ userPayload }: RequestExt, res: Response) {
    try {
      const payload = checkPayload(
        userPayload,
        'Falta información para encontrar usuario'
      );

      res
        .status(202)
        .json({ message: 'Activation in process', state: 'pending' });

      void this.houseService.setAlarmState(payload, Estado.APAGADO);
    } catch (err: any) {
      ErrorHandler.generateResponse(
        res,
        err,
        'Ocurrió un error al desactivar la alarma'
      );
    }
  }
}
