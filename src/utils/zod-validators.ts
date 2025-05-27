import { z } from 'zod';
import { Casa, Dispositivo, Login, Register } from '../interfaces';
import { CentralCodeDTO, CentralInfoDTO } from '../interfaces/central.interface';
import { CasaSchema, CentralSchema, DispositivoSchema, UserSchema } from './user-zod-schemas';

export class ZodValidators {
   private static loginSchema = UserSchema.pick({ email: true, contrasena: true }).strict();
   private static registerSchema = UserSchema.pick({
      nombre: true,
      apellido: true,
      email: true,
      contrasena: true,
      telefono: true
   }).strict();

   private static updateUserSchema = this.registerSchema
      .pick({ nombre: true, apellido: true, telefono: true })
      .extend({
         contrasenaActual: z.string().trim().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
         nuevaContrasena: z.string().trim().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
      })
      .partial()
      .strict();

   private static createHouseSchema = CasaSchema.partial({ sensores: true, camaras: true }).strict();
   private static updateHouseSchema = CasaSchema.pick({ nombre: true, direccion: true }).deepPartial().strict();

   private static createSensorSchema = DispositivoSchema.partial().strict();
   private static nameSensorSchema = DispositivoSchema.pick({ nombre: true, numeroSensor: true }).strict();
   private static infoSensorSchema = DispositivoSchema
      .pick({ dispositivoId: true, numeroSensor: true, tipo: true })
      .partial()
      .strict();

   private static centralCodeSchema = UserSchema
      .pick({ contrasena: true })
      .extend({
         codigoActual: CentralSchema.shape.codigo.describe('Código actual de la central'),
         nuevoCodigo: CentralSchema.shape.codigo.describe('Nuevo código para la central')
      })
      .strict();

   private static centralInfoSchema = CentralSchema.pick({ centralId: true, nombre: true }).strict();

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

   static validateCreateSensorBody (body: Dispositivo) {
      return DispositivoSchema.safeParse(body);
   }

   static validateNameSensorBody (body: Dispositivo) {
      return this.nameSensorSchema.safeParse(body);
   }

   static validateInfoSensorBody (body: Dispositivo) {
      return this.infoSensorSchema.safeParse(body);
   }
   
   static validateCentralCodeBody (body: CentralCodeDTO) {
      return this.centralCodeSchema.safeParse(body);
   }

   static validateCentralInfoBody (body: CentralInfoDTO) {
      return this.centralInfoSchema.safeParse(body);
   }
}
