import mongoose, { HydratedDocument, Schema, Types } from 'mongoose';

import { ControlPanelEventType } from '../../../interfaces';

export interface EventPersistence {
  houseId: Types.ObjectId;
  date: Date;
}

export interface ControlPanelEventPersistence extends EventPersistence {
  type: ControlPanelEventType;
  sensorNumber?: number;
  userId?: Types.ObjectId;
}

export interface SensorEventPersistence extends EventPersistence {
  number: number;
}

export type EventDoc = HydratedDocument<EventPersistence>;

export interface LeanEvent {
  _id?: Types.ObjectId;
  houseId: Types.ObjectId | string;
  date: Date;
  source: 'ControlPanel' | 'Sensor';
  type?: string;
  sensorNumber?: number;
  number?: number;
  userId?: Types.ObjectId | string;
}

const EventBaseSchema = new Schema(
  {
    houseId: { type: Schema.Types.ObjectId, ref: 'House', required: true },
    date: { type: Date, default: Date.now, required: true }
  },
  {
    discriminatorKey: 'source',
    timestamps: false
  }
);

EventBaseSchema.index({ houseId: 1, date: -1 });

export const EventModel = mongoose.model('Event', EventBaseSchema);

export const EventControlPanelModel = EventModel.discriminator(
  'ControlPanel',
  new Schema({
    type: { type: String, enum: Object.values(ControlPanelEventType), required: true },
    sensorNumber: { type: Number, required: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false }
  })
);

export const EventSensorModel = EventModel.discriminator(
  'Sensor',
  new Schema({
    number: { type: Number, required: true }
  })
);
