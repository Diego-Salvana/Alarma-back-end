import { Estado } from './user.interface';

export interface AlarmArming {
  state: Estado;
  excludedSensors: string[];
}

export interface Lights {
  sector: string;
  state: Estado
}

export interface TriggeredAlarm {
  house: string;
  state: Estado;
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
