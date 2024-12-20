import { Estado } from '../interfaces';
import { CentralDataAccess, SensorDataAccess } from '../schemas';

const centralDataAccess = new CentralDataAccess();
const sensorDataAccess = new SensorDataAccess();

export async function updateCentralState (userName: string, houseName: string, message: string) {
   if (message !== 'true' && message !== 'false') return;

   const messageBoolean = message === 'true';
   const res = await centralDataAccess.updateState(userName, houseName, messageBoolean);

   if (res === null) console.log('Casa no encontrada');
}

export async function updateCentralHistory (userName: string, houseName: string, message: string) {
   const activationDate = new Date(message);
   const res = await centralDataAccess.addActivationDate(userName, houseName, activationDate);

   console.log('Fecha: ', activationDate);
   if (res === null) console.log('Casa no encontrada');
}

export async function updateSensorState (userName: string, houseName: string, sensor: string, message: string) {
   try {
      const sensorNumber = parseInt(sensor);

      if (isNaN(sensorNumber)) throw new Error(`El número de sensor ${sensor} no es válido`);

      if (message !== 'activo' && message !== 'inactivo') throw new Error(`El mensaje "${message}" no es válido`);
      
      const state = message === 'activo' ? Estado.ACTIVO : Estado.INACTIVO;

      sensorDataAccess.updateState(userName, houseName, sensorNumber, state);
   } catch (err: any) {
      console.log(err.message);
   }
}

export async function addActivationDate (userName: string, houseName: string, sensor: string, message: string) {
   try {
      const sensorNumber = parseInt(sensor);
      
      if (isNaN(sensorNumber)) throw new Error(`El número de sensor ${sensor} no es válido`);

      const activationDate = new Date(message);

      sensorDataAccess.addActivationDate(userName, houseName, sensorNumber, activationDate);

      console.log('Fecha local: ', activationDate.toLocaleString());
   } catch (err: any) {
      console.log(err.message);
   }
}
