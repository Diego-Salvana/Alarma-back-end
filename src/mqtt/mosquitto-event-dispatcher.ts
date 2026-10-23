import { AlarmArming, State, Lights, WarningType, TriggeredAlarm } from '../interfaces';
import { HouseService } from '../services';

export class MosquittoEventDispatcher {
  constructor (private houseService: HouseService) {}

  onAlarmArming (username: string, houseName: string, state: State, excludedSensors: string[]) {
    const info: AlarmArming = { house: houseName, state, excludedSensors };
    void this.houseService.sendArmingInfo(username, info);
  }

  onLightsChange (username: string, houseName: string, sector: string, state: State) {
    const info: Lights = { house: houseName, sector, state };
    void this.houseService.sendLightsInfo(username, info);
  }

  onWarning (username: string, type: WarningType) {
    void this.houseService.sendWarningByUsername(username, type);
  }

  onTriggered (username: string, houseName: string, ringing: boolean, sensorNumber?: number) {
    const info: TriggeredAlarm = { house: houseName, ringing, sensorNumber };
    void this.houseService.sendTriggeredInfo(username, info);
  }
}
