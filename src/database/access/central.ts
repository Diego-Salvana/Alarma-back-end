import { NotFoundError } from '../../errors';
import { HouseModel } from '../models/house.model';

export class CentralDataAccess {
  private houseModel = HouseModel;

  async updateCode (userId: string, houseId: string, newCode: string): Promise<void> {
    const result = await this.houseModel.updateOne(
      { _id: houseId, userId },
      { $set: { 'controlPanel.alarmCode': newCode } }
    );

    if (result.matchedCount === 0) throw new NotFoundError('User or house not found');
  }

  async updateSirenState (username: string, houseName: string, ringing: boolean): Promise<void> {
    const result = await this.houseModel.updateOne(
      { houseName },
      { $set: { 'controlPanel.ringing': ringing } }
    );

    if (result.matchedCount === 0) throw new NotFoundError('User or house not found');
  }
}
