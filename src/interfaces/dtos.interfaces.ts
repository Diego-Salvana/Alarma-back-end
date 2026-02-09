import { ExclusionSensor } from './domain.interfaces';

// -------------------
/* User */
// -------------------
export interface Login {
  email: string;
  contrasena: string;
}

export interface Register extends Login {
  nombre: string;
  apellido: string;
  telefono: string;
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
