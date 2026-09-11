import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor (message = 'Validation error') {
    super(400, message, 'ValidationError');
  }
}
