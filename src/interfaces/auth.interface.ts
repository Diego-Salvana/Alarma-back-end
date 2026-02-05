import { Casa, Direccion, Dispositivo, Estado } from './user.interface';

export interface Login {
  email: string;
  contrasena: string;
}

export interface Register extends Login {
  nombre: string;
  apellido: string;
  telefono: string;
}

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

export interface SesionToken {
  userId: string;
  houseId: string;
}

export enum Purpose {
  EMAIL_VERIFICATION,
  PASSWORD_RESET
}

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
