import { AlarmArming, State, Lights, WarningType, TriggeredAlarm } from '../interfaces';
import { HouseService } from '../services';

export class MosquittoEventDispatcher {
  constructor (private houseService: HouseService) {}

  /** Despacha al Servicio cuando hay un evento de armado de alarma. */
  onAlarmArming (username: string, houseName: string, state: State, excludedSensors: string[]) {
    const info: AlarmArming = { state, excludedSensors };
    void this.houseService.sendArmingInfo(username, houseName, info);
  }

  /** Despacha al Servicio cuando hay un evento de iluminación. */
  onLightsChange (username: string, houseName: string, sector: string, state: State) {
    const info: Lights = { sector, state };
    void this.houseService.sendLightsInfo(username, houseName, info);
  }

  /** Envía información de warning al Servicio */
  onWarning (username: string, type: WarningType) {
    void this.houseService.sendWarningByUsername(username, type);
  }

  /** Despacha al Servicio cuando hay un evento de disparo de alarma. */
  onTriggered (username: string, houseName: string, ringing: boolean, sensorNumber: number | null) {
    const info: TriggeredAlarm = { house: houseName, ringing, sensorNumber };
    void this.houseService.sendTriggeredInfo(username, houseName, info);
  }
}
