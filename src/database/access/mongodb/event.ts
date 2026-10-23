import { EventControlPanelModel, EventSensorModel, EventModel, LeanEvent } from '../../models/mongodb/event.model';
import { ControlPanelEventType, HouseEvent } from '../../../interfaces';

export class EventDataAccess {
  private eventModel = EventModel;
  private controlPanelModel = EventControlPanelModel;
  private sensorModel = EventSensorModel;

  async addControlPanelEvent (
    houseId: string,
    type: ControlPanelEventType,
    opts?: { userId?: string; date?: Date }
  ): Promise<void> {
    await this.controlPanelModel.create({
      houseId,
      date: opts?.date ?? new Date(),
      type,
      ...(opts?.userId !== undefined && { userId: opts.userId })
    });
  }

  async addSensorEvent (houseId: string, number: number, date: Date = new Date()): Promise<void> {
    await this.sensorModel.create({ houseId, date, number });
  }

  async getByHouse (houseId: string, limit = 100): Promise<HouseEvent[]> {
    const events = await this.eventModel
      .find({ houseId })
      .sort({ date: -1 })
      .limit(limit)
      .lean<LeanEvent[]>();

    return events.map(event => this.toDomain(event));
  }

  async getByHouseAndSensor (houseId: string, sensorNumber: number, limit = 100): Promise<HouseEvent[]> {
    const events = await this.eventModel
      .find({ houseId, source: 'Sensor', number: sensorNumber })
      .sort({ date: -1 })
      .limit(limit)
      .lean<LeanEvent[]>();

    return events.map(event => this.toDomain(event));
  }

  private toDomain (doc: LeanEvent): HouseEvent {
    const base = {
      _id: doc._id?.toString(),
      houseId: doc.houseId.toString(),
      date: doc.date
    };

    if (doc.source === 'ControlPanel') {
      return {
        ...base,
        source: 'ControlPanel',
        type: (doc.type) as ControlPanelEventType,
        ...(doc.userId !== undefined && { userId: doc.userId.toString() })
      };
    }

    return { ...base, source: 'Sensor', number: doc.number as number };
  }
}
