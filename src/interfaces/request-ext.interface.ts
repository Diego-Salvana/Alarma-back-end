import { Request } from 'express';
import { AdminJwtPayload, SessionJwtPayload, VerificationJwtPayload } from './jwt.interfaces';

export interface RequestExt extends Request {
  user?: SessionJwtPayload;
  verificationToken?: VerificationJwtPayload;
  admin?: AdminJwtPayload;
}
