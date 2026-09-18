import { JwtPayload } from 'jsonwebtoken';
import { AdminRole } from './domain.interfaces';

export enum Purpose {
  EMAIL_VERIFICATION = 1,
  PASSWORD_RESET
}

export interface SessionJwtPayload extends JwtPayload {
  sub: string;
  verified: boolean;
  hid?: string;
}

export interface VerificationJwtPayload extends JwtPayload {
  username: string;
  purpose: Purpose;
}

export interface AdminJwtPayload extends JwtPayload {
  sub: string;
  role: AdminRole;
}
