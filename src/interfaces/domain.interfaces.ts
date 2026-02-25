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

// -------------------
// Value Objects
// -------------------
export interface EventLog {
  fechaHora: Date;
}

export interface ControlPanelEventLog {
  fechaHora: Date;
  numeroDispositivo: number;
}

export interface EventLogWithName {
  fechaHora: Date;
  nombreDispositivo: string;
}

export interface Address {
  calle: string;
  numero: string;
  ciudad: string;
}

// -------------------
// Entities
// -------------------
export interface ControlPanel {
  centralId: string;
  nombre: string;
  codigo: number;
  alarmaEncendida: State;
  sonando: boolean;
  historial: ControlPanelEventLog[];
}

export interface Device {
  dispositivoId: string;
  numeroSensor: number;
  nombre: string;
  tipo: DeviceType;
  estado: State;
  historial: EventLog[];
}

export interface House {
  _id: string;
  nombre: string;
  nombreCasa: string;
  direccion: Address;
  central: ControlPanel;
  sensores: Device[];
  camaras: Device[];
}

export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  email: string;
  contrasena: string;
  mosquittoPass: string;
  telefono: string;
  habilitado: boolean;
  casas: House[];
}

// -------------------
// Users
// -------------------
export type Role = 'user' | 'admin';

export interface Register {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  telefono: string;
}

// -------------------
// Houses
// -------------------
type CreateHouseRequired = Pick<House, 'nombre' | 'direccion' | 'central'>;
type CreateHouseOptional = Partial<Pick<House, 'sensores' | 'camaras'>>;

export interface CreateHouseInfo extends CreateHouseRequired, CreateHouseOptional {}

// -------------------
// Central
// -------------------
export type CentralProperty = 'alarmaEncendida' | 'sonando' | 'historial';

// -------------------
// Sensors
// -------------------
export type SensorProperty = 'estado';

export interface SensorArmConfig {
  numeroSensor: number;
  estado: State;
};

export type CreateSensor = Pick<Device, 'dispositivoId' | 'nombre' | 'numeroSensor' | 'tipo'>;
