import { NextFunction, Response } from 'express';
import { RequestExt, VerificationJwtPayload } from '../interfaces';
import { ErrorHandler, JwtHandler, Unauthorized } from '../utils';

export function checkVerificationJwt (req: RequestExt, res: Response, next: NextFunction) {
  try {
    const token = req.body.token;
    if (!token) throw new Unauthorized('Token no proporcionado');

    const payload = JwtHandler.verifyToken<VerificationJwtPayload>(token);
    if (!payload.username) throw new Unauthorized('Falta información para encontrar usuario');
    if (!payload.purpose) throw new Unauthorized('Falta propósito');

    req.verificationToken = payload;

    next();
  } catch (err: any) {
    err.name === 'JsonWebTokenError'
      ? res.status(401).send({ errorType: err.name, message: err.message })
      : ErrorHandler.generateResponse(res, err, 'Ocurrió un error al verificar token');
  }
};
