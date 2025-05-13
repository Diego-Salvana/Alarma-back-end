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

export interface BodyPayload {
   userId: string;
   houseId?: string;
}

export interface LoginResponse {
   nombre: string;
   habilitado: boolean;
   token: string;
   casas: HouseResponse[];
}

export interface HouseResponse {
   _id: string;
   nombre: string;
   direccion: Direccion;
   alarmaEncendida: Estado;
   sonando?: boolean;
   sensores?: Dispositivo[];
   token?: string;
}

export interface ProfileResponse {
   nombre: string;
   apellido: string;
   email: string;
   telefono: string;
   habilitado: boolean;
   casas: HouseResponse[];
}
