import { NextFunction, Response } from 'express';
import { AdminJwtPayload, RequestExt } from '../interfaces';
import { ErrorHandler, JwtHandler, Unauthorized } from '../utils';

export function checkAdminJwt (req: RequestExt, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ').pop();
    if (!token) throw new Unauthorized('Token no proporcionado');

    const payload = JwtHandler.verifyToken<AdminJwtPayload>(token, 'admin');
    if (!payload.sub) throw new Unauthorized('Falta información para encontrar usuario');
    if (payload.role !== 'admin') throw new Unauthorized('No tienes permiso para acceder');

    req.admin = payload;

    next();
  } catch (err: any) {
    err.name === 'JsonWebTokenError'
      ? res.status(401).send({ errorType: err.name, message: err.message })
      : ErrorHandler.generateResponse(res, err, 'Ocurrió un error al verificar token');
  }
};
