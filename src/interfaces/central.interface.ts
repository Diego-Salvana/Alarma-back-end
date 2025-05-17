export interface CentralCodeDTO {
   contrasena: string;
   codigoActual: number;
   nuevoCodigo: number;
}

export interface CentralInfoDTO {
   centralId?: string;
   nombre?: string;
}

export type CentralProperty = 'alarmaEncendida' | 'activada' | 'historial';
