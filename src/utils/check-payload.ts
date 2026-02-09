import { Unauthorized } from './custom-errors';
import { SessionJwtPayload } from '../interfaces';

/** Chequea `payload` de usuario, y lo retorna. De lo contrario lanza un error. */
export function checkUserPayload (
  payload: SessionJwtPayload | undefined,
  message = 'No se proporcionó un token válido'
): SessionJwtPayload {
  if (!payload) throw new Unauthorized(message);

  return payload;
}
