// -------------------
// Enums
// -------------------
export enum State {
  ON = 'On',
  OFF = 'Off'
}

export enum DeviceType {
  MOVEMENT = 'Movimiento',
  WINDOW = 'Ventana',
  SMOKE = 'Humo',
  CAMERA = 'Camara'
}

export enum HouseAction {
  SET_ARMED_STATE = 'SET_ARMED_STATE',
  TRIGGER_ALARM = 'TRIGGER_ALARM',
  SET_LIGHTS = 'SET_LIGHTS',
}

export enum ControlPanelEventType {
  ALARM_TRIGGERED = 'ALARM_TRIGGERED',
  ARMED = 'ARMED',
  DISARMED = 'DISARMED'
}

// -------------------
// Value Objects
// -------------------
export interface EventLog {
  date: Date;
}

export interface ControlPanelEventLog {
  date: Date;
  sensorNumber: number;
}

export interface EventLogWithName {
  date: Date;
  type?: ControlPanelEventType | 'SENSOR';
  deviceName?: string;
  sensorNumber?: number;
  userId?: string;
}

export interface Address {
  street: string;
  number: string;
  city: string;
  country: string;
}

// -------------------
// Entities
// -------------------
export interface ControlPanel {
  model: string;
  alarmCode: string;
  alarmState: State;
  ringing: boolean;
}

export interface Sensor {
  model: string;
  number: number;
  name: string;
  type: DeviceType;
  state: State;
}

export interface Camera {
  model: string;
  number: number;
  name: string;
}

export interface House {
  _id: string;
  userId: string;
  name: string;
  houseName: string;
  address: Address;
  controlPanel: ControlPanel;
  sensors: Sensor[];
  cameras: Camera[];
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  enabled: boolean;
}

// -------------------
// Admins (PostgreSQL domain)
// -------------------
export type AdminRole = 'admin' | 'superadmin';

export interface Admin {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdmin {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
}

export type AuditAction =
  | 'ADMIN_LOGIN'
  | 'CREATE_ADMIN'
  | 'UPDATE_ADMIN'
  | 'DEACTIVATE_ADMIN'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'CREATE_HOUSE'
  | 'UPDATE_HOUSE'
  | 'DELETE_HOUSE'
  | 'CREATE_SENSOR'
  | 'UPDATE_SENSOR'
  | 'DELETE_SENSOR';

export type AuditEntityType = 'admin' | 'user' | 'house' | 'sensor' | 'auth';

export interface AuditLogEntry {
  id: string;
  adminId: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

// -------------------
// Events (standalone collection)
// -------------------
export type EventSource = 'ControlPanel' | 'Sensor';

export interface BaseEvent {
  _id?: string;
  houseId: string;
  date: Date;
  source: EventSource;
}

export interface ControlPanelEvent extends BaseEvent {
  source: 'ControlPanel';
  type: ControlPanelEventType;
  sensorNumber?: number;
  userId?: string;
}

export interface SensorEvent extends BaseEvent {
  source: 'Sensor';
  number: number;
}

export type HouseEvent = ControlPanelEvent | SensorEvent;

// -------------------
// Users
// -------------------
export type Role = 'user' | 'admin';

export interface Register {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

// -------------------
// Houses
// -------------------
type CreateHouseRequired = Pick<House, 'name' | 'address' | 'controlPanel'>;
type CreateHouseOptional = Partial<Pick<House, 'houseName' | 'sensors' | 'cameras'>>;

export interface CreateHouseInfo extends CreateHouseRequired, CreateHouseOptional {}

// -------------------
// Central
// -------------------
export type CentralProperty = 'alarmState' | 'ringing';

// -------------------
// Sensors
// -------------------
export type SensorProperty = 'state';

export interface SensorArmConfig {
  number: number;
  state: State;
};

export type CreateSensor = Pick<Sensor, 'model' | 'name' | 'number' | 'type'>;
