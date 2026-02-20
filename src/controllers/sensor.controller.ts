import { Response } from 'express';
import { SensorService } from '../services';
import { RequestExt, SessionJwtPayload } from '../interfaces';
import { BadRequest, ErrorHandler } from '../utils';
import { requireUserIdAndHouseId } from '../utils/required-ids';

/** Gestiona peticiones y respuestas vinculadas a Sensores. */
export class SensorController {
  constructor (private sensorService: SensorService) {}

  async getOne ({ user, params }: RequestExt, res: Response) {
    try {
      const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);
      const sensorNumber = Number(params.sensorNumber);

      if (isNaN(sensorNumber)) throw new BadRequest('Número de sensor no válido');

      const responseSensor = await this.sensorService.getOne(sub, hid, sensorNumber);
      
      res.status(200).json({ message: 'Satisfactory request', data: responseSensor });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al obtener la casa');
    }
  }

  async updateName ({ user, body }: RequestExt, res: Response) {
    try {
      const { sub, hid } = requireUserIdAndHouseId(user as SessionJwtPayload);
      const { numeroSensor, nombre } = body;
      const responseSensor = await this.sensorService.updateName(sub, hid, numeroSensor, nombre);

      res.status(200).json({ message: 'Updated successfully', data: responseSensor });
    } catch (err: any) {
      ErrorHandler.generateResponse(res, err, 'Ocurrió un error al actualizar casa');
    }
  }
}
