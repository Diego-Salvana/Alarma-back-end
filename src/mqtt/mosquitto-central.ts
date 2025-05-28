import { Estado } from '../interfaces';
import { CentralDataAccess } from '../schemas';
import { verifySensorNumber } from './utils';

export class MosquittoCentralService {
   constructor (private centralDataAccess: CentralDataAccess) {}

   async updateState (userName: string, houseName: string, message: string) {
      const capMessage = message.charAt(0).toUpperCase() + message.slice(1);
      
      try {
         if (capMessage !== Estado.ENCENDIDO && capMessage !== Estado.APAGADO) {
            throw new Error(`El mensaje "${message}" no es válido`);
         }
   
         await this.centralDataAccess.updateState(userName, houseName, capMessage as Estado);
      } catch (err: any) {
         console.log(`Error (method: "updateCentralState"): ${err.message as string}`);
      }
   }
   
   // Este es el método en el cual se colocaría alguna acción para avisar al usuario de la activación de la alarma.
   async setActivation (userName: string, houseName: string, message: string) {
      try {
         const sensorNumber = verifySensorNumber(message);
         
         const activationDate = new Date(Date.now());
   
         await this.centralDataAccess.setActivation(userName, houseName, sensorNumber, activationDate);
      } catch (err: any) {
         console.log(`Error (method: "setCentralActivation"): ${err.message as string}`);
      }
   }
}
