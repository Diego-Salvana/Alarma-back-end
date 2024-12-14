import { Central } from '../interfaces';
import { CentralInfoDTO } from '../interfaces/central.interface';
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
}
