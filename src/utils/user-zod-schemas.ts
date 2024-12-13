import { z } from 'zod';

// Historial Validation
export const HistorialSchema = z.object({
   fechaHora: z.date().default(() => new Date())
});

// Dirección Validation
export const DireccionSchema = z.object({
   calle: z.string({ invalid_type_error: 'La calle debe ser cadena de texto.' })
      .trim()
      .min(1, { message: 'La calle es requerida' }),
   numero: z.number().int().positive({ message: 'El número debe ser positivo.' }),
   ciudad: z.string({ invalid_type_error: 'La ciudad debe ser cadena de texto.' })
      .trim()
      .min(1, { message: 'La ciudad es requerida' })
});

// Central Validation
export const CentralSchema = z.object({
   centralId: z.string().trim().min(1),
   nombre: z.string().trim().min(1),
   alarmaEncendida: z.boolean({ message: 'El tipo debe ser boolean.' }).default(false)
});

// Dispositivo Validation
export const DispositivoSchema = z.object({
   dispositivoId: z.string().trim().min(1),
   numeroSensor: z.number().int().positive({ message: 'El número de sensor debe ser positivo.' }),
   nombre: z.string().trim().min(1),
   tipo: z.string().trim().min(1),
   estado: z.enum(['Activado', 'Desactivado'])
});

// Casa Validation
export const CasaSchema = z.object({
   nombre: z.string().trim().min(1),
   direccion: DireccionSchema,
   central: CentralSchema,
   sensores: z.array(DispositivoSchema),
   camaras: z.array(DispositivoSchema)
});

// Usuario Validation
export const UserSchema = z.object({
   nombre: z.string().trim().min(1, { message: 'El nombre es requerido.' }),
   apellido: z.string().trim().min(1, { message: 'El apellido es requerido.' }),
   nombreUsuario: z.string().trim().min(1, { message: 'El nombre de usuario es requerido.' }),
   email: z.string().trim().email({ message: 'Formato de correo no válido.' }),
   contrasena: z.string().trim().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
   mosquittoPass: z.string().trim().min(1, { message: 'La contraseña de Mosquitto es requerida.' }),
   telefono: z.string().trim().min(1, { message: 'El teléfono es requerido.' }),
   habilitado: z.boolean().default(false),
   casas: z.array(CasaSchema)
});
