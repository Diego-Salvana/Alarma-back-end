import { NextFunction, Response } from 'express';

import { AdminJwtPayload, RequestExt } from '../interfaces';
import { JwtHandler } from '../utils';
import { ForbiddenError, UnauthorizedError } from '../errors';

/** Middleware que verifica el token de administrador (roles admin y superadmin). */
export function checkAdminJwt (req: RequestExt, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ').pop();
  if (!token) throw new UnauthorizedError('Token not provided');

  const payload = JwtHandler.verifyToken<AdminJwtPayload>(token, 'admin');
  if (!payload.sub) throw new UnauthorizedError('Missing admin ID in token');
  if (payload.role !== 'admin' && payload.role !== 'superadmin') {
    throw new UnauthorizedError('Admin access required');
  }

  req.admin = payload;

  next();
};

/** Autorización solo-superadmin. Debe usarse después de checkAdminJwt. */
export function requireSuperadmin (req: RequestExt, res: Response, next: NextFunction) {
  if (!req.admin) throw new UnauthorizedError('Token not provided');
  if (req.admin.role !== 'superadmin') throw new ForbiddenError('Superadmin access required');

  next();
};
