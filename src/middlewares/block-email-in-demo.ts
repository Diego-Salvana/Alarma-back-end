import { NextFunction, Response } from 'express';
import { RequestExt } from '../interfaces';
import { ServiceUnavailableError } from '../errors';

/** Bloquea las rutas que dependen del envío de emails cuando está deshabilitado en la demo. */
export function blockEmailInDemo (req: RequestExt, res: Response, next: NextFunction) {
  if (process.env.DEMO_DISABLED_EMAIL === 'true') {
    throw new ServiceUnavailableError('Email features are disabled in this demo');
  }

  next();
};
