import { NextFunction, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

import { RequestExt } from '../interfaces';
import { AppError } from '../errors';

export function errorHandler (error: unknown, req: RequestExt, res: Response, next: NextFunction) {
  if (error instanceof AppError) {
    res.status(error.statusCode).send({
      name: error.name,
      message: error.message,
      statusCode: error.statusCode
    });

    return;
  }

  if (error instanceof JsonWebTokenError) {
    res.status(401).send({
      name: 'Unauthorized',
      message: error.message,
      statusCode: 401
    });

    return;
  }
  
  console.error('Error:', error);

  res.status(500).send({
    name: 'InternalServerError',
    message: 'Internal server error',
    statusCode: 500
  });
}
