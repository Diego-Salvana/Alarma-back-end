import { SessionJwtPayload } from '../interfaces';
import { ValidationError } from '../errors';

export function requireUserIdAndHouseId (userPayload: SessionJwtPayload): { sub: string; hid: string } {
  const { sub, hid } = userPayload;
  if (!hid) throw new ValidationError('Missing house ID');

  return { sub, hid };
}
