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
  state: State;
  sensorNumber: number | null;
}

export enum HouseAction {
  SET_ARMED_STATE = 'SET_ARMED_STATE',
  TRIGGER_ALARM = 'TRIGGER_ALARM',
  SET_LIGHTS = 'SET_LIGHTS',
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
