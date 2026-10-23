import { merge } from 'lodash';
import { Types } from 'mongoose';

import { House, State } from '../../../interfaces';
import { ConflictError, NotFoundError } from '../../../errors';
import { HouseModel, LeanHouse } from '../../models/mongodb/house.model';
import { LeanUser } from '../../models/mongodb/user.model';

type PopulatedHouse = Omit<LeanHouse, 'userId'> & { userId: LeanUser | Types.ObjectId | string };

export class HouseDataAccess {
  private houseModel = HouseModel;

  async create (userId: string, houseData: Omit<House, '_id'>): Promise<House> {
    try {
      const created = await this.houseModel.create({ ...houseData, userId });
      const obj = created.toObject();

      return this.toDomain({ ...obj, _id: obj._id, userId: obj.userId });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictError(`House ${houseData.houseName} already exists or user not found`);
      }
      throw err;
    }
  }

  async getAllByUserId (userId: string): Promise<House[]> {
    const houses = await this.houseModel.find({ userId }).lean<LeanHouse[]>();

    return houses.map(house => this.toDomain(house));
  }

  async getOne (userId: string, houseId: string): Promise<House> {
    const house = await this.houseModel
      .findOne({ _id: houseId, userId })
      .lean<LeanHouse>();

    if (house === null) throw new NotFoundError('House not found');

    return this.toDomain(house);
  }

  /** Obtiene una casa por username + houseName (identidad MQTT/WS). */
  async getByHouseName (username: string, houseName: string): Promise<House> {
    const house = await this.houseModel
      .findOne({ houseName })
      .populate('userId')
      .lean<PopulatedHouse>();

    if (house === null) throw new NotFoundError('House not found');

    const owner = house.userId;
    let ownerUsername: string | undefined;
    let ownerId: string;

    if (typeof owner === 'object' && owner !== null && 'username' in owner) {
      ownerUsername = (owner).username;
      ownerId = (owner)._id.toString();
    } else {
      ownerId = (owner).toString();
    }

    if (ownerUsername !== undefined && ownerUsername !== username) {
      throw new NotFoundError('House not found');
    }

    return this.toDomain({ ...house, userId: ownerId });
  }

  /** Obtiene una casa por houseId resolviendo su dueño (uso interno MQTT). */
  async getById (houseId: string): Promise<House> {
    const house = await this.houseModel
      .findById(houseId)
      .lean<LeanHouse>();

    if (house === null) throw new NotFoundError('House not found');

    return this.toDomain(house);
  }

  /** Actualiza una casa específica del usuario (nombre y dirección). */
  async updateHouseInfo (userId: string, houseId: string, houseBody: Partial<House>): Promise<House> {
    const house = await this.getOne(userId, houseId);

    const updateBody: Partial<House> = {
      ...(houseBody.name && { name: houseBody.name }),
      ...(houseBody.address && { address: houseBody.address })
    };

    const updatedHouseData = merge({}, house, updateBody);

    const updated = await this.houseModel
      .findOneAndUpdate(
        { _id: houseId, userId },
        { $set: { name: (updatedHouseData as House).name, address: (updatedHouseData as House).address } },
        { new: true }
      )
      .lean<LeanHouse>();

    if (updated === null) throw new NotFoundError('User or house not found during update');

    return this.toDomain(updated);
  }

  async updateSystemInfo (userId: string, houseId: string, houseBody: Partial<House>): Promise<House> {
    const house = await this.getOne(userId, houseId);

    const updateBody: Partial<House> = {
      houseName: houseBody.houseName ?? house.houseName,
      controlPanel: {
        ...house.controlPanel,
        model: houseBody.controlPanel?.model ?? house.controlPanel.model
      },
      address: {
        street: houseBody.address?.street ?? house.address.street,
        number: houseBody.address?.number ?? house.address.number,
        city: houseBody.address?.city ?? house.address.city,
        country: houseBody.address?.country ?? house.address.country
      }
    };

    try {
      const updated = await this.houseModel
        .findOneAndUpdate(
          { _id: houseId, userId },
          {
            $set: {
              houseName: updateBody.houseName,
              'controlPanel.model': updateBody.controlPanel?.model,
              address: updateBody.address
            }
          },
          { new: true }
        )
        .lean<LeanHouse>();

      if (updated === null) throw new NotFoundError('User or house not found during update');

      return this.toDomain(updated);
    } catch (err: any) {
      if (err.code === 11000) throw new ConflictError('House name already exists');
      throw err;
    }
  }

  /** Elimina una casa del usuario. */
  async delete (userId: string, houseId: string): Promise<void> {
    const result = await this.houseModel.deleteOne({ _id: houseId, userId });

    if (result.deletedCount === 0) throw new NotFoundError('House not found');
  }

  /** Actualiza el estado de la alarma y sus sensores en una casa. */
  async updateAlarmState (username: string, houseName: string, exclusionArray?: string[]): Promise<void> {
    const house = await this.houseModel.findOne({ houseName });

    if (house === null) throw new NotFoundError('House not found');

    if (exclusionArray) {
      house.sensors.forEach(sensor => {
        sensor.state = exclusionArray.includes(sensor.number.toString())
          ? State.OFF
          : State.ON;
      });

      house.controlPanel.alarmState = State.ON;
    } else {
      house.controlPanel.alarmState = State.OFF;
      house.controlPanel.ringing = false;
    }

    await house.save();
  }

  /** Actualiza el estado de la alarma por IDs (uso HTTP/ timer). */
  async updateAlarmStateById (houseId: string, exclusionArray?: string[]): Promise<void> {
    const house = await this.houseModel.findById(houseId);

    if (house === null) throw new NotFoundError('House not found');

    if (exclusionArray) {
      house.sensors.forEach(sensor => {
        sensor.state = exclusionArray.includes(sensor.number.toString())
          ? State.OFF
          : State.ON;
      });

      house.controlPanel.alarmState = State.ON;
    } else {
      house.controlPanel.alarmState = State.OFF;
      house.controlPanel.ringing = false;
    }

    await house.save();
  }

  private toDomain (doc: LeanHouse | (Omit<LeanHouse, 'userId'> & { userId: string })): House {
    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      name: doc.name,
      houseName: doc.houseName,
      address: doc.address,
      controlPanel: doc.controlPanel,
      sensors: doc.sensors,
      cameras: doc.cameras
    };
  }
}
