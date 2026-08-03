import { Response } from 'express';
import { CustomError } from './custom-errors';

export class ErrorHandler {
  /** Genera una respuesta de error HTTP personalizada. */
  static generateResponse (res: Response, err: any, defaultMessage?: string) {
    // console.log('ErrorHandler: ', err);

    if (err instanceof CustomError) {
      res.status(err.statusCode).json({
        name: err.name,
        message: err.message,
        code: err.statusCode
      });
    } else {
      res.status(500).json({
        name: err.name,
        message: defaultMessage ?? 'Internal Server Error'
      });
    }
  }
}
