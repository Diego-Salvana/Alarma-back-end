import { loginSchema, registerSchema, updateUserSchema, userSystemInfoSchema } from '../utils/zod-validators';
import { ExclusionSensor, House } from './domain.interfaces';
import { z } from 'zod';

// -------------------
/* User */
// -------------------
export type Login = z.infer<typeof loginSchema>;

export type Register = z.infer<typeof registerSchema>;

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

export type UserSystemInfoDTO = z.infer<typeof userSystemInfoSchema>;

// -------------------
/* Houses */
// -------------------
type CreateHouseRequired = Pick<House, 'nombre' | 'direccion' | 'central'>;
type CreateHouseOptional = Partial<Pick<House, 'sensores' | 'camaras'>>;

export interface CreateHouseDTO extends CreateHouseRequired, CreateHouseOptional {}

export interface HouseSystemInfoDTO {
  nombreCasa?: string;
  central?: CentralInfoDTO;
}

// -------------------
/* Central */
// -------------------
export interface CentralCodeDTO {
  contrasena: string;
  codigoActual: number;
  nuevoCodigo: number;
}

export interface CentralInfoDTO {
  centralId?: string;
  nombre?: string;
}

// -------------------
/* Sensors */
// -------------------
export interface CreateSensorDTO {
  dispositivoId: string;
  numeroSensor: number;
  nombre: string;
  tipo: string;
}

export interface SensorNameDTO {
  numeroSensor: number;
  nombre: string;
}

export interface SensorInfoDTO {
  dispositivoId: string;
  numeroSensor: number;
  tipo: string;
}

export interface ExcludeArrayDTO {
  exclusionArray: ExclusionSensor[];
}
