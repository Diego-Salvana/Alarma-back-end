import { State, DeviceType, EventLog } from './domain.interfaces';

export interface ApiResponse<T> {
  message: string;
  data?: T;
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
  direccion: AddressResponse;
  alarmaEncendida: State;
  sonando?: boolean;
  sensores?: DeviceResponse[];
  token?: string;
}

export interface ProfileResponse {
  _id: string;
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

export interface DeviceResponse {
  dispositivoId: string;
  numeroSensor: number;
  nombre: string;
  tipo: DeviceType;
  estado: State;
  historial: EventLog[];
}

export interface AddressResponse {
  calle: string;
  numero: string;
  ciudad: string;
}
