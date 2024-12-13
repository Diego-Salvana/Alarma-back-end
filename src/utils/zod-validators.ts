import { Casa, Login, Register } from '../interfaces';
import { CasaSchema, UserSchema } from './user-zod-schemas';

export class ZodValidators {
   private static loginSchema = UserSchema.pick({ email: true, contrasena: true });
   private static registerSchema = UserSchema.pick({
      nombre: true,
      apellido: true,
      email: true,
      contrasena: true,
      telefono: true
   });

   private static updateUserSchema = this.registerSchema.partial({ contrasena: true });
   private static createHouseSchema = CasaSchema.partial({ sensores: true, camaras: true });
   private static updateHouseSchema = CasaSchema.pick({ nombre: true, direccion: true }).deepPartial().strict();

   static validateRegisterBody (body: Register) {
      return this.registerSchema.safeParse(body);
   }

   static validateLoginBody (body: Login) {
      return this.loginSchema.safeParse(body);
   }

   static validateUpdateUserBody (body: Register) {
      return this.updateUserSchema.safeParse(body);
   }

   static validateCreateHouseBody (body: Casa) {
      return this.createHouseSchema.safeParse(body);
   }

   static validateUpdateHouseBody (body: Casa) {
      return this.updateHouseSchema.safeParse(body);
   }
}
