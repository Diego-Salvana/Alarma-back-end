import { State } from './domain.interfaces';

interface WebSocketTransferBase {
  house: string;
}

export interface AlarmArming extends WebSocketTransferBase {
  state: State;
  excludedSensors: string[];
}

export interface Lights extends WebSocketTransferBase {
  sector: string;
  state: State
}

export interface TriggeredAlarm extends WebSocketTransferBase {
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
