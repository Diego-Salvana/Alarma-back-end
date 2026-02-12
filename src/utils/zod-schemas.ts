import { z } from 'zod';
import { DeviceType, State } from '../interfaces';

// Tipo de Estado
export const StateSchema = z.nativeEnum(State, { message: 'El estado debe ser "On"/"Off"' });

// Tipo Dispositivo
export const DeviceTypeSchema = z.nativeEnum(
  DeviceType,
  { message: 'El tipo de sensor debe ser "Movimiento"/"Ventana"/"Humo"/"Camara"' }
);

// Dirección
export const AddressSchema = z.object({
  calle: z
    .string({ invalid_type_error: 'La calle debe ser cadena de texto.' })
    .trim()
    .min(1, { message: 'La calle es requerida' }),
  numero: z
    .number()
    .int()
    .positive({ message: 'El número debe ser positivo.' }),
  ciudad: z
    .string({ invalid_type_error: 'La ciudad debe ser cadena de texto.' })
    .trim()
    .min(1, { message: 'La ciudad es requerida' })
});

// Central
export const CentralSchema = z.object({
  centralId: z.string().trim().min(1),
  nombre: z.string().trim().min(1),
  codigo: z
    .number()
    .int()
    .min(100000, { message: 'Mínimo 6 dígitos' })
    .max(999999, { message: 'Máximo 6 dígitos' }),
  alarmaEncendida: StateSchema,
  sonando: z.boolean()
});

// Dispositivo
export const DeviceSchema = z.object({
  dispositivoId: z.string().trim().min(1),
  numeroSensor: z.number().int().positive({ message: 'El número de sensor debe ser positivo.' }),
  nombre: z.string().trim().min(1),
  tipo: DeviceTypeSchema,
  estado: StateSchema
});

// Casa
export const HouseSchema = z.object({
  nombre: z.string().trim().min(1, { message: 'El nombre de la casa es requerido.' }),
  direccion: AddressSchema,
  central: CentralSchema,
  sensores: z.array(DeviceSchema),
  camaras: z.array(DeviceSchema)
});

// Usuario
export const UserSchema = z.object({
  nombre: z.string().trim().min(1, { message: 'El nombre es requerido.' }),
  apellido: z.string().trim().min(1, { message: 'El apellido es requerido.' }),
  nombreUsuario: z.string().trim().min(1, { message: 'El nombre de usuario es requerido.' }),
  email: z.string().trim().email({ message: 'Formato de correo no válido.' }),
  contrasena: z
    .string()
    .trim()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  mosquittoPass: z.string().trim().min(1),
  telefono: z.string().trim().min(1, { message: 'El teléfono es requerido.' }),
  habilitado: z.boolean().default(false),
  casas: z.array(HouseSchema)
});

// Petición de activación de sirena
export const TriggeredSchema = z.object({
  sonando: CentralSchema.shape.sonando
});

// Array de Exclusión
export const ExclusionSensorSchema = z.object({
  exclusionArray: z.object({
    numeroSensor: DeviceSchema.shape.numeroSensor,
    estado: DeviceSchema.shape.estado
  }).array()
});
