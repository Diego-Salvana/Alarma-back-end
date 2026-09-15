import { State, DeviceType } from './domain.interfaces';

export interface ApiResponse<T = null> {
  message: string;
  data: T;
}

export interface LoginResponse {
  firstName: string;
  email: string;
  enabled: boolean;
  token: string;
  houses: HouseResponse[];
}

export interface HouseResponse {
  _id: string;
  name: string;
  houseName: string;
  address: AddressResponse;
  alarmState: State;
  ringing?: boolean;
  sensors?: DeviceResponse[];
  cameras?: CameraResponse[];
  token?: string;
}

export interface ProfileResponse {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  houses: HouseResponse[];
}

export interface DeviceResponse {
  model: string;
  number: number;
  name: string;
  type: DeviceType;
  state: State;
}

export interface CameraResponse {
  model: string;
  number: number;
  name: string;
}

export interface AddressResponse {
  street: string;
  number: string;
  city: string;
  country: string;
}
