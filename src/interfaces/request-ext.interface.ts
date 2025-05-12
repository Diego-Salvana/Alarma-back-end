import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface JwtPayloadExt extends JwtPayload {
   hid?: string;
}

export interface RequestExt extends Request {
   userPayload?: JwtPayloadExt;
}
