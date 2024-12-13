import { JwtPayload, sign, verify, decode } from 'jsonwebtoken';
import { BodyPayload, JwtPayloadExt } from '../interfaces';

export class JWTHandler {
   private static JWT_SECRET = process.env.JWT_SECRET as string;

   static generateToken (userBody: BodyPayload): string {
      const payload: JwtPayloadExt = {
         sub: userBody.id,
         name: userBody.nombreUsuario,
         mosPass: userBody.mosquittoPass
      };

      return sign(payload, this.JWT_SECRET, { expiresIn: '90 days' });
   };
   
   static verifyToken (token: string): string | JwtPayload {
      return verify(token, this.JWT_SECRET);
   };

   static decode (token: string): JwtPayload | string | null {
      return decode(token);
   }
}
