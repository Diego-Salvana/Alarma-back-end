import { JwtPayload, sign, verify, decode } from 'jsonwebtoken';
import { TokenPayload, JwtPayloadExt } from '../interfaces';

/** Clase que contiene métodos para generar, verificar y decodificar tokens JWT. */
export class JwtHandler {
  private static JWT_SECRET = process.env.JWT_SECRET as string;

  static generateIdToken (userBody: TokenPayload): string {
    const payload: JwtPayloadExt = {
      sub: userBody.userId,
      hid: userBody.houseId
    };

    return sign(payload, this.JWT_SECRET, { expiresIn: '90 days' });
  };

  static generateUsernameToken (username: string): string {
    const payload = { username };

    return sign(payload, this.JWT_SECRET);
  };
   
  static verifyToken (token: string): string | JwtPayload {
    return verify(token, this.JWT_SECRET);
  };

  static decode (token: string): JwtPayload | string | null {
    return decode(token);
  }
}
