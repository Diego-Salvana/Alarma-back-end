import { JwtPayload, sign, verify, decode } from 'jsonwebtoken';
import { SesionToken, JwtPayloadExt, Purpose } from '../interfaces';

/** Clase que contiene métodos para generar, verificar y decodificar tokens JWT. */
export class JwtHandler {
  private static JWT_SECRET = process.env.JWT_SECRET as string;

  static generateIdToken (userBody: SesionToken): string {
    const payload: JwtPayloadExt = {
      sub: userBody.userId,
      hid: userBody.houseId,
      verified: userBody.verified ?? false
    };

    return sign(payload, this.JWT_SECRET, { expiresIn: '90 days' });
  };

  /* Utilizado para verificación de correo y restablecimiento de contraseña */
  static generateUsernameToken (username: string, purpose: Purpose, expiresIn = '90 days'): string {
    const payload = { username, purpose };

    return sign(payload, this.JWT_SECRET, { expiresIn });
  };
   
  static verifyToken (token: string): string | JwtPayload {
    return verify(token, this.JWT_SECRET);
  };

  static decode (token: string): JwtPayload | string | null {
    return decode(token);
  }
}
