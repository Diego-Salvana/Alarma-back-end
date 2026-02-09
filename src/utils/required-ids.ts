import { BadRequest } from './custom-errors';
import { SessionJwtPayload } from '../interfaces';

export function requireUserIdAndHouseId (userPayload: SessionJwtPayload) {
  const { sub, hid } = userPayload;
  if (!hid) throw new BadRequest('Falta información para encontrar casa');

  return { sub, hid };
}
