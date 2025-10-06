import { AlarmActivation } from '../interfaces/websockets-transfers';
import { HouseDataAccess } from '../schemas';
// import { verifySensorNumber } from './utils';

export class MosquittoCentralService {
	constructor (private houseDataAccess: HouseDataAccess) {}

	/** Actualiza el estado (encendido / apagado) de la alarma en la base de datos. */
	async updateState (userName: string, houseName: string, activationInfo: AlarmActivation):
	Promise<void> {
		try {
			if (activationInfo.state === 'On') {
				await this.houseDataAccess.activeAlarm(userName, houseName, activationInfo.excludedSensors);
			} else {
				await this.houseDataAccess.disarmAlarm(userName, houseName);
			}
		} catch (err: any) {
			console.log(`Error (method: "updateCentralState"): ${err.message as string}`);
		}
	}
   
	// Este es el método en el cual se colocaría alguna acción para avisar al usuario de la activación de la alarma.
	async setActivation (userName: string, houseName: string, message: string) {
		try {
			// const sensorNumber = verifySensorNumber(message);
         
			// const activationDate = new Date(Date.now());
   
			// await this.centralDataAccess.setActivation(userName, houseName, sensorNumber, activationDate);
		} catch (err: any) {
			console.log(`Error (method: "setCentralActivation"): ${err.message as string}`);
		}
	}
}
