import { NextFunction, Response } from 'express';

import { AdminJwtPayload, RequestExt } from '../interfaces';
import { JwtHandler } from '../utils';
import { UnauthorizedError } from '../errors';

/** Middleware que verifica el token de administrador. */
export function checkAdminJwt (req: RequestExt, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ').pop();
  if (!token) throw new UnauthorizedError('Token not provided');

  const payload = JwtHandler.verifyToken<AdminJwtPayload>(token, 'admin');
  if (!payload.sub) throw new UnauthorizedError('Missing user ID in token');
  if (payload.role !== 'admin') throw new UnauthorizedError('Admin access required');

  req.admin = payload;

  next();
};
