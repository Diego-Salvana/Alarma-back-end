import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Purpose } from './auth.interface';

export interface JwtPayloadExt extends JwtPayload {
  hid: string;
  sub: string;
  username?: string;
  purpose?: Purpose;
}

export interface RequestExt extends Request {
  userPayload?: JwtPayloadExt;
}
