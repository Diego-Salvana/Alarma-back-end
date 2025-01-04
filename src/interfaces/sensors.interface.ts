export interface SensorNameDTO {
   numeroSensor: number;
   nombre: string;
}

export interface SensorInfoDTO {
   dispositivoId: string;
   numeroSensor: number;
   tipo: string;
}

export type SensorProperty = 'estado' | 'activado';
