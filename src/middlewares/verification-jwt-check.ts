import { NextFunction, Response } from 'express';

import { RequestExt, VerificationJwtPayload } from '../interfaces';
import { JwtHandler } from '../utils';
import { UnauthorizedError } from '../errors';

/** Middleware que chequea el token de verificación de usuario. */
export function checkVerificationJwt (req: RequestExt, res: Response, next: NextFunction) {
  const token = req.body.token;
  if (!token) throw new UnauthorizedError('Token not provided');

  const payload = JwtHandler.verifyToken<VerificationJwtPayload>(token);
  if (!payload.username) throw new UnauthorizedError('Missing username in token');
  if (!payload.purpose) throw new UnauthorizedError('Missing purpose in token');

  req.verificationToken = payload;

  next();
};
