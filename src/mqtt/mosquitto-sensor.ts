import { SensorDataAccess } from '../schemas';
import { Estado } from '../interfaces';
import { verifySensorNumber } from './utils';

export class MosquittoSensorService {
   constructor (private sensorDataAccess: SensorDataAccess) {}

   async updateState (userName: string, houseName: string, sensor: string, message: string) {
      try {
         const sensorNumber = parseInt(sensor);
         const capMessage = message.charAt(0).toUpperCase() + message.slice(1);
   
         if (isNaN(sensorNumber)) throw new Error(`El número de sensor ${sensor} no es válido`);
   
         if (capMessage !== Estado.ENCENDIDO && capMessage !== Estado.APAGADO) {
            throw new Error(`El mensaje "${message}" no es válido`);
         }
         
         const state = capMessage as Estado;
   
         await this.sensorDataAccess.updateState(userName, houseName, sensorNumber, state);
      } catch (err: any) {
         console.log(`Error (method: "updateSensorState"): ${err.message as string}`);
      }
   }
   
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
