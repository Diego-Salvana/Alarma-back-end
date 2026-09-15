import mongoose, { HydratedDocument, Schema, Types } from 'mongoose';

import { Address, Camera, ControlPanel, Sensor } from '../../interfaces';

export interface HousePersistence {
  userId: Types.ObjectId;
  name: string;
  houseName: string;
  address: Address;
  controlPanel: ControlPanel;
  sensors: Sensor[];
  cameras: Camera[];
}

export type HouseDoc = HydratedDocument<HousePersistence>;

export type LeanHouse = HousePersistence & { _id: Types.ObjectId };

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    number: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  { _id: false }
);

const ControlPanelSchema = new Schema(
  {
    model: { type: String, required: true },
    alarmCode: { type: String, required: true },
    alarmState: { type: String, enum: ['On', 'Off'], required: true },
    ringing: { type: Boolean, required: true, default: false }
  },
  { _id: false }
);

const SensorSchema = new Schema(
  {
    model: { type: String, required: true },
    number: { type: Number, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    state: { type: String, enum: ['On', 'Off'], required: true, default: 'On' }
  },
  { _id: false }
);

const CameraSchema = new Schema(
  {
    model: { type: String, required: true },
    number: { type: Number, required: true },
    name: { type: String, required: true }
  },
  { _id: false }
);

const HouseSchema = new Schema<HousePersistence>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, default: 'House' },
    houseName: { type: String, required: true },
    address: AddressSchema,
    controlPanel: ControlPanelSchema,
    sensors: [SensorSchema],
    cameras: [CameraSchema]
  },
  { timestamps: true, versionKey: '__v' }
);

HouseSchema.index({ userId: 1, houseName: 1 }, { unique: true });

export const HouseModel = mongoose.model<HousePersistence>('House', HouseSchema);
