import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface JwtPayloadExt extends JwtPayload {
   name: string;
   house?: string;
   mosPass: string;
}

export interface RequestExt extends Request {
   userPayload?: JwtPayloadExt;
}
