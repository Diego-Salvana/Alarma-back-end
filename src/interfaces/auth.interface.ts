import { Casa, Direccion, Estado } from './user.interface';

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
}
