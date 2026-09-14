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
  calle: z
    .string()
    .trim()
    .min(1, { message: 'The street is required' }),
  numero: z
    .string()
    .trim()
    .min(1, { message: 'The number is required' }),
  ciudad: z
    .string()
    .trim()
    .min(1, { message: 'The city is required' })
});

// Central
export const CentralSchema = z.object({
  centralId: z.string().trim().min(1),
  nombre: z.string().trim().min(1),
  codigo: z
    .number()
    .int()
    .min(100000, { message: 'Minimum 6 digits' })
    .max(999999, { message: 'Maximum 6 digits' }),
  alarmaEncendida: StateSchema,
  sonando: z.boolean()
});

// Dispositivo
export const DeviceSchema = z.object({
  dispositivoId: z.string().trim().min(1),
  numeroSensor: z.number().int().positive({ message: 'The sensor number must be positive.' }),
  nombre: z.string().trim().min(1),
  tipo: DeviceTypeSchema,
  estado: StateSchema
});

// House
export const HouseSchema = z.object({
  nombre: z.string().trim().min(1, { message: 'The house name is required.' }),
  nombreCasa: z.string().trim().min(1, { message: 'The house name is required.' }),
  direccion: AddressSchema,
  central: CentralSchema,
  sensores: z.array(DeviceSchema),
  camaras: z.array(DeviceSchema)
});

// User
export const UserSchema = z.object({
  nombre: z.string().trim().min(1, { message: 'The first name is required.' }),
  apellido: z.string().trim().min(1, { message: 'The last name is required.' }),
  nombreUsuario: z.string().trim().min(1, { message: 'The username is required.' }),
  email: z.string().trim().email({ message: 'Invalid email format.' }),
  contrasena: z
    .string()
    .trim()
    .min(6, { message: 'The password must be at least 6 characters long.' }),
  mosquittoPass: z.string().trim().min(1),
  telefono: z.string().trim().min(1, { message: 'The phone number is required.' }),
  habilitado: z.boolean().default(false),
  casas: z.array(HouseSchema)
});

// -------------------
/* Action Schemas */
// -------------------

// Arm configuration
export const ArmConfigurationSchema = z.object({
  sensors: z.object({
    numeroSensor: DeviceSchema.shape.numeroSensor,
    estado: DeviceSchema.shape.estado
  }).strict().array()
});

// Alarm triggered
export const TriggeredSchema = z.object({
  sonando: CentralSchema.shape.sonando,
  numeroSensor: DeviceSchema.shape.numeroSensor
});
