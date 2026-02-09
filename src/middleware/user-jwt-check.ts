import { NextFunction, Response } from 'express';
import { RequestExt, SessionJwtPayload } from '../interfaces';
import { ErrorHandler, JwtHandler, Unauthorized } from '../utils';

export function checkUserJwt (req: RequestExt, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ').pop();
    if (!token) throw new Unauthorized('Token no proporcionado');

    const sessionPayload = JwtHandler.verifyToken<SessionJwtPayload>(token);
    if (!sessionPayload.sub) throw new Unauthorized('Falta información para encontrar usuario');
    if (!sessionPayload.verified) throw new Unauthorized('Usuario no verificado');

    req.user = sessionPayload;

    next();
  } catch (err: any) {
    err.name === 'JsonWebTokenError'
      ? res.status(401).send({ errorType: err.name, message: err.message })
      : ErrorHandler.generateResponse(res, err, 'Ocurrió un error al verificar token');
  }
};
