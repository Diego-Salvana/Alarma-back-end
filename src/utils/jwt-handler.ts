import { JwtPayload, sign, verify, decode, type SignOptions } from 'jsonwebtoken';
import { SessionJwtPayload, Purpose, VerificationJwtPayload, AdminJwtPayload, Role } from '../interfaces';

export class JwtHandler {
  private static USER_JWT = process.env.USER_JWT_SECRET as string;
  private static ADMIN_JWT = process.env.ADMIN_JWT_SECRET as string;

  static generateUserIdToken (userId: string, verified: boolean, houseId?: string): string {
    const payload: SessionJwtPayload = {
      sub: userId,
      verified,
      hid: houseId ?? ''
    };

    return sign(payload, this.USER_JWT, { expiresIn: '90 days' });
  }

  /* Utilizado para verificación de correo y restablecimiento de contraseña */
  static generateUsernameToken (username: string, purpose: Purpose, expiresIn: SignOptions['expiresIn'] = '90 days'): string {
    const payload: VerificationJwtPayload = { username, purpose };

    return sign(payload, this.USER_JWT, { expiresIn });
  }

  static generateAdminToken (userId: string): string {
    const payload: AdminJwtPayload = { sub: userId, role: 'admin' };

    return sign(payload, this.ADMIN_JWT, { expiresIn: '1d' });
  }
   
  static verifyToken <T> (token: string, role: Role = 'user'): T {
    return verify(token, role === 'admin' ? this.ADMIN_JWT : this.USER_JWT) as T;
  }
}
