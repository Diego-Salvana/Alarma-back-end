import { State } from './domain.interfaces';

export interface AlarmArming {
  state: State;
  excludedSensors: string[];
}

export interface Lights {
  sector: string;
  state: State
}

export interface TriggeredAlarm {
  house: string;
  ringing: boolean;
  sensorNumber: number | null;
}

export enum WarningType {
  DEVICE_STATE = 'DEVICE_STATE',
  LIGHTS_STATE = 'LIGHTS_STATE',
  TRIGGER_ALARM = 'TRIGGER_ALARM'
}

export interface Warning {
  type: WarningType;
  message: string;
}
