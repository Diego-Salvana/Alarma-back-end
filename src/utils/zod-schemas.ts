import { z } from 'zod';
import { DeviceType, State } from '../interfaces';

// State Type
export const StateSchema = z.nativeEnum(State, { message: 'The state must be "On"/"Off"' });

// Device Type
export const DeviceTypeSchema = z.nativeEnum(
  DeviceType,
  { message: 'The sensor type must be "Motion"/"Window"/"Smoke"/"Camera"' }
);

// Address
export const AddressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(1, { message: 'The street is required' }),
  number: z
    .string()
    .trim()
    .min(1, { message: 'The number is required' }),
  city: z
    .string()
    .trim()
    .min(1, { message: 'The city is required' }),
  country: z
    .string()
    .trim()
    .min(1, { message: 'The country is required' })
});

// ControlPanel
export const ControlPanelSchema = z.object({
  model: z.string().trim().min(1),
  alarmCode: z.string().trim().min(1),
  alarmState: StateSchema,
  ringing: z.boolean()
});

// Sensor
export const SensorSchema = z.object({
  model: z.string().trim().min(1),
  number: z.number().int().positive({ message: 'The sensor number must be positive.' }),
  name: z.string().trim().min(1),
  type: DeviceTypeSchema,
  state: StateSchema
});

// Camera
export const CameraSchema = z.object({
  model: z.string().trim().min(1),
  number: z.number().int().positive({ message: 'The camera number must be positive.' }),
  name: z.string().trim().min(1)
});

// House
export const HouseSchema = z.object({
  name: z.string().trim().min(1, { message: 'The house name is required.' }),
  houseName: z.string().trim().min(1, { message: 'The house identifier is required.' }),
  address: AddressSchema,
  controlPanel: ControlPanelSchema,
  sensors: z.array(SensorSchema),
  cameras: z.array(CameraSchema)
});

// User
export const UserSchema = z.object({
  firstName: z.string().trim().min(1, { message: 'The first name is required.' }),
  lastName: z.string().trim().min(1, { message: 'The last name is required.' }),
  username: z.string().trim().min(1, { message: 'The username is required.' }),
  email: z.string().trim().email({ message: 'Invalid email format.' }),
  password: z
    .string()
    .trim()
    .min(6, { message: 'The password must be at least 6 characters long.' }),
  phone: z.string().trim().min(1, { message: 'The phone number is required.' }),
  enabled: z.boolean().default(false)
});

// -------------------
/* Action Schemas */
// -------------------

// Arm configuration
export const ArmConfigurationSchema = z.object({
  sensors: z.object({
    number: SensorSchema.shape.number,
    state: SensorSchema.shape.state
  }).strict().array()
});

// Alarm triggered
export const TriggeredSchema = z.object({
  ringing: ControlPanelSchema.shape.ringing,
  number: SensorSchema.shape.number
});
