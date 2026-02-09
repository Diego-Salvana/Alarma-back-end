import { JwtPayload } from 'jsonwebtoken';

export enum Purpose {
  EMAIL_VERIFICATION,
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
  role: 'admin';
}
