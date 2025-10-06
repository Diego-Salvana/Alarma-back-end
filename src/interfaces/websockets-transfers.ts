import { Estado } from './user.interface';

export interface AlarmActivation {
	state: Estado;
	excludedSensors: string[];
}

export type Topic = 'alarmActivation' | 'ringing';
