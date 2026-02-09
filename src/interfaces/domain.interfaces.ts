import { Register } from './dtos.interfaces';
import { Casa, Estado } from './schemas.interface';

export interface RegisterDB extends Register {
  nombreUsuario: string;
  mosquittoPass: string;
  habilitado: boolean;
  casas: Casa[];
}

export interface UpdateUser extends Register {
  contrasenaActual?: string;
  nuevaContrasena?: string;
}

export type Role = 'user' | 'admin';

export type CentralProperty = 'alarmaEncendida' | 'sonando' | 'historial';

export type SensorProperty = 'estado' | 'activado';

export interface ExclusionSensor {
  numeroSensor: string;
  estado: Estado;
};
