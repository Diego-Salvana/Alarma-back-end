import { House, HouseResponse } from '../interfaces';
import { JwtHandler } from '../utils';

export class HouseDto {
  /** Transforma datos de una casa en un objeto HouseResponse. */
  houseResponse (house: House, newToken = false, userId?: string, verified = false): HouseResponse {
    let token: string | undefined;

    if (newToken && userId) {
      token = JwtHandler.generateUserIdToken(userId, verified, house._id);
    }

    const houseData: HouseResponse = {
      _id: house._id,
      name: house.name,
      houseName: house.houseName,
      address: house.address,
      alarmState: house.controlPanel.alarmState,
      ringing: house.controlPanel.ringing,
      sensors: house.sensors,
      cameras: house.cameras,
      token
    };

    return houseData;
  }

  /** Transforma datos de una lista de casas en un array de HouseResponse. */
  housesListResponse (houses: House[]): HouseResponse[] {
    return houses.map(house => ({
      _id: house._id,
      name: house.name,
      houseName: house.houseName,
      address: house.address,
      alarmState: house.controlPanel.alarmState
    }));
  }
}
