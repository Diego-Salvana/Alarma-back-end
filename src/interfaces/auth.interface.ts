import { ObjectId } from 'mongoose';
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
   id: string;
   nombreUsuario: string;
   mosquittoPass: string;
}

export interface LoginResponse {
   id: ObjectId;
   nombre: string;
   apellido: string;
   email: string;
   nombreUsuario: string; // Debe ir en JWT
   mosquittoPass: string; // Debe ir en JWT
   habilitado: boolean;
   token: string;
   casas: Casa[];
}
