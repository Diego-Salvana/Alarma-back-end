export interface CentralCodeDTO {
   codigo: number;
}

export interface CentralInfoDTO {
   centralId?: string;
   nombre?: string;
}

export type CentralProperty = 'alarmaEncendida' | 'activada' | 'historial';
