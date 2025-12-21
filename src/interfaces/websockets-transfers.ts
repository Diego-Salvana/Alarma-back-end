import { Estado } from './user.interface';

export interface AlarmArming {
  state: Estado;
  excludedSensors: string[];
}

export type Topic = 'alarmActivation' | 'ringing';
