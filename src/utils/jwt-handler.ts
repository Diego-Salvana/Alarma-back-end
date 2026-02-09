import { JwtPayload, sign, verify, decode } from 'jsonwebtoken';
import { SessionJwtPayload, Purpose, VerificationJwtPayload } from '../interfaces';

/** Clase que contiene métodos para generar, verificar y decodificar tokens JWT. */
export class JwtHandler {
  private static JWT_SECRET = process.env.JWT_SECRET as string;

  static generateIdToken (userId: string, verified: boolean, houseId?: string): string {
    const payload: SessionJwtPayload = {
      sub: userId,
      verified,
      hid: houseId ?? ''
    };

    return sign(payload, this.JWT_SECRET, { expiresIn: '90 days' });
  };

  /* Utilizado para verificación de correo y restablecimiento de contraseña */
  static generateUsernameToken (username: string, purpose: Purpose, expiresIn = '90 days'): string {
    const payload: VerificationJwtPayload = { username, purpose };

    return sign(payload, this.JWT_SECRET, { expiresIn });
  };
   
  static verifyToken <T> (token: string): T {
    return verify(token, this.JWT_SECRET) as T;
  };

  static decode (token: string): JwtPayload | string | null {
    return decode(token);
  }
}
