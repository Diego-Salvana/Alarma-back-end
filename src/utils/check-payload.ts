import { BadRequest } from './custom-errors';
import { JwtPayloadExt } from '../interfaces';

export function checkPayload (payload: JwtPayloadExt | undefined, message: string): JwtPayloadExt {
   if (payload === undefined) throw new BadRequest(message);

   return payload;
}
