import { AppError } from './AppError';

export class ServiceUnavailableError extends AppError {
  constructor (message = 'Service unavailable') {
    super(503, message, 'ServiceUnavailable');
  }
}
