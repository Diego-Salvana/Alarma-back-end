import { Estado } from './user.interface';

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

export interface ExclusionSensor {
	numeroSensor: string;
	estado: Estado;
};

export interface ExcludeArrayDTO {
	exclusionArray: ExclusionSensor[];
}
