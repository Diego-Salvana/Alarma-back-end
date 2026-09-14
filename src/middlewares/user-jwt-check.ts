import { NextFunction, Response } from 'express';
import { RequestExt, SessionJwtPayload } from '../interfaces';
import { JwtHandler } from '../utils';
import { UnauthorizedError } from '../errors';

/** Middleware que verifica el token de sesión de usuario. */
export function checkUserJwt (req: RequestExt, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ').pop();
  if (!token) throw new UnauthorizedError('Token not provided');

  const sessionPayload = JwtHandler.verifyToken<SessionJwtPayload>(token);
  if (!sessionPayload.sub) throw new UnauthorizedError('Missing user ID in token');
  if (!sessionPayload.verified) throw new UnauthorizedError('User not verified');

  req.user = sessionPayload;

  next();
};
