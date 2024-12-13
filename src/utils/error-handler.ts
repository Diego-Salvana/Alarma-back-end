import { Response } from 'express';
import { CustomError } from './custom-errors';

export class ErrorHandler {
   static generateResponse (res: Response, err: any, defaultMessage?: string) {
      console.log('Error en Handle: ', err);

      if (err instanceof CustomError) {
         res.status(err.statusCode).json({
            name: err.name,
            message: err.message,
            code: err.statusCode,
            isCustom: err instanceof CustomError // Quitar en producción
         });
      } else {
         res.status(500).json({
            name: err.name,
            message: defaultMessage ?? 'Internal Server Error',
            isCustom: err instanceof CustomError// Quitar en producción
         });
      }
   }
}
