import { NextFunction, Response } from 'express';

import { RequestExt } from '../interfaces';
import { AppError } from '../errors/AppError';

export function errorHandler (error: unknown, req: RequestExt, res: Response, next: NextFunction) {
  if (error instanceof AppError) {
    res.status(error.statusCode).send({
      name: error.name,
      message: error.message,
      statusCode: error.statusCode
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
