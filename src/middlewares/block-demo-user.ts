import { NextFunction, Response } from 'express';
import { RequestExt, SessionJwtPayload } from '../interfaces';
import { ErrorHandler, Forbidden, Unauthorized, isDemoUser } from '../utils';

/** Impide que el usuario de demostración modifique información permanente. */
export function blockDemoUser (req: RequestExt, res: Response, next: NextFunction) {
  try {
    const { sub } = req.user as SessionJwtPayload;
    if (!sub) throw new Unauthorized('Falta información para encontrar usuario');

    if (isDemoUser(sub)) {
      throw new Forbidden('Esta acción no está disponible para el usuario de demostración.');
    }

    next();
  } catch (err: any) {
    ErrorHandler.generateResponse(res, err, 'Ocurrió un error al bloquear usuario de demostración');
  }
};
