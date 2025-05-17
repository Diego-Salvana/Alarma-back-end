import { NextFunction, Response } from 'express';
import { JwtPayloadExt, RequestExt } from '../interfaces';
import { BadRequest, CustomError, JWTHandler } from '../utils';

export function checkJWT (req: RequestExt, res: Response, next: NextFunction) {
   try {
      const token = req.headers.authorization?.split(' ').pop() ?? '';
      const jwtPayload = JWTHandler.verifyToken(token) as JwtPayloadExt;

      if (!jwtPayload.sub) throw new BadRequest('Falta información para encontrar usuario');
      
      req.userPayload = jwtPayload;

      next();
   } catch (err: any) {
      console.log(err);

      if (err.name === 'JsonWebTokenError') {
         res.status(401).send({ errorType: err.name, message: err.message });
      } else if (err instanceof CustomError) {
         res.status(err.statusCode).json({ name: err.name, message: err.message, code: err.statusCode });
      } else {
         res.status(500).send({ errorType: 'ServerError', message: err.message });
      }
   }
};
