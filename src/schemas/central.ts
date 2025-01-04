import { Central, Estado, Historial } from '../interfaces';
import { CentralInfoDTO } from '../interfaces/central.interface';
import { NotFound } from '../utils';
import { UserModel } from './user';

export class CentralDataAccess {
   private userModel = UserModel;
   private noSensorsHistory = '-casas.sensores.historial -casas.camaras.historial';
   private noCentralHistory = '-casas.central.historial';

   async getOne (userId: string, houseId: string): Promise<Central | null> {
      const user = await this.userModel
         .findOne({ _id: userId, 'casas._id': houseId })
         .select(this.noSensorsHistory)
         .lean();

      const house = user?.casas.find(h => h._id.toString() === houseId);

      return house?.central ?? null;
   }

   async updateCode (userId: string, houseId: string, code: number): Promise<Central | null> {
      const user = await this.userModel
         .findOneAndUpdate(
            { _id: userId, 'casas._id': houseId },
            { $set: { 'casas.$.central.codigo': code } },
            { new: true }
         )
         .select(`${this.noSensorsHistory} ${this.noCentralHistory}`);
      
      const house = user?.casas.find(h => h._id.toString() === houseId);
   
      return house?.central ?? null;
   }

   async updateInfo (userId: string, houseId: string, infoBody: CentralInfoDTO): Promise<Central | null> {
      const user = await this.userModel
         .findOneAndUpdate(
            { _id: userId, 'casas._id': houseId },
            {
               $set: {
                  'casas.$.central.centralId': infoBody.centralId,
                  'casas.$.central.nombre': infoBody.nombre
               }
            },
            { new: true }
         )
         .select(`${this.noSensorsHistory} ${this.noCentralHistory}`);
      
      const house = user?.casas.find(h => h._id.toString() === houseId);
   
      return house?.central ?? null;
   }

   async updateState (userName: string, houseName: string, state: Estado): Promise<void> {
      const user = await this.userModel
         .findOneAndUpdate(
            { nombreUsuario: userName, 'casas.nombreCasa': houseName },
            { $set: { 'casas.$.central.alarmaEncendida': state, 'casas.$.central.activada': 'false' } },
            { new: true }
         )
         .select(`${this.noSensorsHistory} ${this.noCentralHistory}`);
      
      if (user === null) throw new NotFound('Usuario o casa no encontrados');
   }

   async setActivation (userName: string, houseName: string, date: Date): Promise<void> {
      const utcDate = new Date(date.toISOString());
      const activationDate: Historial = { fechaHora: utcDate };

      const user = await this.userModel
         .findOneAndUpdate(
            { nombreUsuario: userName, 'casas.nombreCasa': houseName },
            {
               $set: { 'casas.$.central.activada': 'true' },
               $push: { 'casas.$.central.historial': { $each: [activationDate], $position: 0 } }
            },
            { new: true }
         )
         .select(`${this.noSensorsHistory} ${this.noCentralHistory}`);

      if (user === null) throw new NotFound('Usuario o casa no encontrados');
   }
}
