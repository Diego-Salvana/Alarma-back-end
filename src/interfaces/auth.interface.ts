import { Casa } from './user.interface';

export interface Login {
   email: string;
   contrasena: string;
}

export interface Register extends Login {
   nombre: string;
   apellido: string;
   telefono: string;
   nombreUsuario?: string;
   mosquittoPass?: string;
   habilitado?: boolean;
   casas?: Casa[];
}

export interface BodyPayload {
   userId: string;
   houseId?: string;
}

export interface LoginResponse {
   nombre: string;
   apellido: string;
   email: string;
   habilitado: boolean;
   token: string;
   casas: Casa[];
}
