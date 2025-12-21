import { SensorDataAccess } from '../schemas';
import { verifySensorNumber } from './utils';

export class MosquittoSensorService {
  constructor (private sensorDataAccess: SensorDataAccess) {}
   
  async updateHistory (userName: string, houseName: string, message: string) {
    try {
      const sensorNumber = verifySensorNumber(message);
   
      const activationDate = new Date(Date.now());
   
      await this.sensorDataAccess.addActivationDate(userName, houseName, sensorNumber, activationDate);
    } catch (err: any) {
      console.log(`Error (method: "updateSensorHistory"): ${err.message as string}`);
    }
  }
}
