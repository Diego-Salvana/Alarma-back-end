import { Response } from 'express';

import { ApiResponse } from '../interfaces';

export function sendSuccess<T> (res: Response, statusCode: number, message: string, data: T): void {
  const response: ApiResponse<T> = { message, data };

  res.status(statusCode).json(response);
}
