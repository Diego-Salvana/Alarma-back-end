import { State } from '../interfaces';
import { CentralSchema, DeviceSchema, UserSchema, ArmConfigurationSchema, TriggeredSchema, HouseSchema } from './zod-schemas';

export const loginSchema = UserSchema.pick({ email: true, contrasena: true }).strict();
export const registerSchema = UserSchema.pick({
  nombre: true,
  apellido: true,
  email: true,
  contrasena: true,
  telefono: true
}).strict();

export const updateUserSchema = registerSchema
  .pick({ nombre: true, apellido: true, telefono: true })
  .extend({
    contrasenaActual: UserSchema.shape.contrasena,
    nuevaContrasena: UserSchema.shape.contrasena
  })
  .partial()
  .strict();

export const userSystemInfoSchema = UserSchema
  .pick({ nombreUsuario: true, mosquittoPass: true, habilitado: true })
  .partial()
  .strict();

export const createHouseSchema = HouseSchema
  .partial({ sensores: true, camaras: true })
  .omit({ nombreCasa: true })
  .strict();
  
export const updateHouseSchema = HouseSchema
  .pick({ nombre: true, direccion: true })
  .deepPartial()
  .strict();

export const createSensorSchema = DeviceSchema.omit({ estado: true }).strict();
export const sensorNameSchema = DeviceSchema.pick({ nombre: true, numeroSensor: true }).strict();
export const sensorSystemInfoSchema = DeviceSchema
  .pick({ dispositivoId: true, numeroSensor: true, tipo: true })
  .partial()
  .strict();

export const centralCodeSchema = UserSchema
  .pick({ contrasena: true })
  .extend({
    codigoActual: CentralSchema.shape.codigo.describe('Código actual de la central'),
    nuevoCodigo: CentralSchema.shape.codigo.describe('Nuevo código para la central')
  })
  .strict();

export const centralSystemInfoSchema = CentralSchema
  .pick({ centralId: true, nombre: true })
  .partial()
  .strict();

export const houseSystemInfoSchema = HouseSchema.pick({ nombreCasa: true })
  .extend({ central: centralSystemInfoSchema })
  .partial()
  .strict();

export const armConfigurationSchema = ArmConfigurationSchema
  .strict()
  .refine(
    ({ sensors }) => sensors.some(sensor => sensor.estado === State.ON),
    { message: 'Al menos un sensor debe estar encendido' }
  );

export const triggeredSchema = TriggeredSchema.partial({ numeroSensor: true }).strict();
