import { AlarmArming } from '../interfaces/websockets-transfers';
import { HouseDataAccess } from '../schemas';
// import { verifySensorNumber } from './utils';

export class MosquittoCentralService {
  constructor (private houseDataAccess: HouseDataAccess) {}

  /** Actualiza el `estado` (encendido / apagado) de la alarma en la base de datos. */
  async updateState (userName: string, houseName: string, activationInfo: AlarmArming):
  Promise<void> {
    try {
      if (activationInfo.state === 'On') {
        await this.houseDataAccess.updateAlarmState(
          userName, houseName, activationInfo.excludedSensors
        );
      } else {
        await this.houseDataAccess.updateAlarmState(userName, houseName);
      }
    } catch (err: any) {
      console.log(`Error (method: "updateCentralState"): ${err.message as string}`);
    }
  }
}
