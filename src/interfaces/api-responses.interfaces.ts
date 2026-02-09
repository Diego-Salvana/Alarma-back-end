import { Direccion, Dispositivo, Estado } from './schemas.interface';

export interface LoginResponse {
  nombre: string;
  email: string;
  habilitado: boolean;
  token: string;
  casas: HouseResponse[];
}

export interface HouseResponse {
  _id: string;
  nombre: string;
  nombreCasa: string;
  direccion: Direccion;
  alarmaEncendida: Estado;
  sonando?: boolean;
  sensores?: Dispositivo[];
  token?: string;
}

export interface ProfileResponse {
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  email: string;
  telefono: string;
  habilitado: boolean;
  casas: HouseResponse[];
}

export interface EmailVerification {
  message: string;
  token: string;
}
