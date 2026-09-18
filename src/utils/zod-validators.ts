import { State } from '../interfaces';
import { z } from 'zod';
import { ControlPanelSchema, SensorSchema, UserSchema, ArmConfigurationSchema, TriggeredSchema, HouseSchema, AddressSchema } from './zod-schemas';

export const loginSchema = UserSchema.pick({ email: true, password: true }).strict();
export const registerSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  phone: true
}).strict();

export const updateUserSchema = registerSchema
  .pick({ firstName: true, lastName: true, phone: true })
  .extend({
    currentPassword: UserSchema.shape.password,
    newPassword: UserSchema.shape.password
  })
  .partial()
  .strict();

export const userSystemInfoSchema = UserSchema
  .pick({ username: true, enabled: true })
  .partial()
  .strict();

export const createHouseSchema = HouseSchema
  .partial({ sensors: true, cameras: true, houseName: true })
  .omit({ houseName: true })
  .strict();

export const updateHouseSchema = HouseSchema
  .pick({ name: true, address: true })
  .deepPartial()
  .strict();

export const createSensorSchema = SensorSchema.omit({ state: true }).strict();
export const sensorNameSchema = SensorSchema.pick({ name: true, number: true }).strict();
export const sensorSystemInfoSchema = SensorSchema
  .pick({ model: true, number: true, type: true })
  .partial()
  .strict();

export const centralCodeSchema = UserSchema
  .pick({ password: true })
  .extend({
    currentCode: ControlPanelSchema.shape.alarmCode.describe('Current central code'),
    newCode: ControlPanelSchema.shape.alarmCode.describe('New central code')
  })
  .strict();

export const centralSystemInfoSchema = ControlPanelSchema
  .pick({ model: true })
  .partial()
  .strict();

export const houseSystemInfoSchema = HouseSchema
  .pick({ houseName: true })
  .extend({ controlPanel: centralSystemInfoSchema, address: AddressSchema.partial() })
  .partial()
  .strict();

export const armConfigurationSchema = ArmConfigurationSchema
  .strict()
  .refine(
    ({ sensors }) => sensors.some(sensor => sensor.state === State.ON),
    { message: 'At least one sensor must be turned on' }
  );

export const triggeredSchema = TriggeredSchema.partial({ number: true }).strict();

// Admins (PostgreSQL domain)
export const createAdminSchema = z.object({
  firstName: UserSchema.shape.firstName,
  lastName: UserSchema.shape.lastName,
  email: UserSchema.shape.email,
  password: UserSchema.shape.password,
  role: z.enum(['admin', 'superadmin'])
}).strict();

export const updateAdminSchema = createAdminSchema.partial().strict();
