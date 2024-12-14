import { Document, ObjectId } from 'mongoose';

export enum Estado {
   ACTIVO = 'Activo',
   INACTIVO = 'Inactivo'
}

// Historial Interface
export interface Historial {
   fechaHora: Date;
}

// Dirección Interface
export interface Direccion {
   calle: string;
   numero: number;
   ciudad: string;
}

// Central Interface
export interface Central {
   centralId: string;
   nombre: string;
   codigo: number;
   alarmaEncendida: boolean;
   historial: Historial[];
}

// Dispositivo Interface (Sensores y Cámaras)
export interface Dispositivo {
   dispositivoId: string;
   numeroSensor: number;
   nombre: string;
   tipo: string; // Usar un tipo enum si los valores de tipo son limitados
   estado: Estado;
   historial: Historial[];
}

// Casa Interface
export interface Casa {
   _id: string;
   nombre: string;
   nombreCasa: string;
   direccion: Direccion;
   central: Central;
   sensores: Dispositivo[];
   camaras: Dispositivo[];
}

// Usuario Interface
export interface User {
   _id: ObjectId | unknown;
   nombre: string;
   apellido: string;
   nombreUsuario: string;
   email: string;
   contrasena: string;
   mosquittoPass: string;
   telefono: string;
   habilitado: boolean;
   casas: Casa[];
}

export interface IUserDocument extends User, Document {
   createdAt: Date;
   updatedAt: Date;
   __v: number;
}
