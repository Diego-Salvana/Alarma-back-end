import { NextFunction, Response } from 'express';
import { RequestExt, SessionJwtPayload } from '../interfaces';
import { isDemoUser } from '../utils';
import { ForbiddenError, UnauthorizedError } from '../errors';

/** Impide que el usuario de demostración modifique información permanente. */
export function blockDemoUser (req: RequestExt, res: Response, next: NextFunction) {
  const { sub } = req.user as SessionJwtPayload;
  if (!sub) throw new UnauthorizedError('Missing user ID');

  if (isDemoUser(sub)) {
    throw new ForbiddenError('Action not available for demo user');
  }

  next();
};
