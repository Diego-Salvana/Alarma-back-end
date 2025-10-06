import { BadRequest } from './custom-errors';
import { JwtPayloadExt } from '../interfaces';

/** Chequea si existe un `payload`, y lo retorna. De lo contrario lanza un error con el mensaje del 2° parámetro */
export function checkPayload (payload: JwtPayloadExt | undefined, message: string): JwtPayloadExt {
	if (payload === undefined) throw new BadRequest(message);

	return payload;
}
