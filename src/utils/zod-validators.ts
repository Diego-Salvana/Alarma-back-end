import { z } from 'zod';
import { Casa, Dispositivo, Estado, ExcludeArrayDTO, Login, Register } from '../interfaces';
import { CentralCodeDTO, CentralInfoDTO } from '../interfaces/central.interface';
import { CasaSchema, CentralSchema, DispositivoSchema, UserSchema, ExclusionSensorSchema, TriggeredSchema } from './user-zod-schemas';

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
      contrasenaActual: z
        .string()
        .trim()
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
      nuevaContrasena: z
        .string()
        .trim()
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    })
    .partial()
    .strict();

  private static createHouseSchema = CasaSchema.partial({ sensores: true, camaras: true }).strict();
  private static updateHouseSchema = CasaSchema
    .pick({ nombre: true, direccion: true })
    .deepPartial()
    .strict();

  private static sensorNameSchema = DispositivoSchema
    .pick({ nombre: true, numeroSensor: true })
    .strict();

  private static sensorInfoSchema = DispositivoSchema
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
  private static triggeredReqSchema = TriggeredSchema.strict();

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

  static validateSensorNameBody (body: Dispositivo) {
    return this.sensorNameSchema.safeParse(body);
  }

  static validateSensorInfoBody (body: Dispositivo) {
    return this.sensorInfoSchema.safeParse(body);
  }
   
  static validateCentralCodeBody (body: CentralCodeDTO) {
    return this.centralCodeSchema.safeParse(body);
  }

  static validateCentralInfoBody (body: CentralInfoDTO) {
    return this.centralInfoSchema.safeParse(body);
  }

  static validateExclusionArray (body: ExcludeArrayDTO) {
    return ExclusionSensorSchema.safeParse(body);
  }

  static validateTriggeredBody (body: { state: Estado }) {
    return this.triggeredReqSchema.safeParse(body);
  }
}
