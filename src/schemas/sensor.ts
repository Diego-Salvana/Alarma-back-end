import { merge } from 'lodash';
import { Casa, User } from '../interfaces';
import { AlreadyExists, NotFound } from '../utils';
import { UserModel } from './user';

export class SensorDataAccess {
   private userModel = UserModel;

   // async create (userId: string, house: Casa): Promise<User | null> {
   //    const user = await this.userModel.findOne({ _id: userId, 'casas.nombreCasa': house.nombreCasa });

   //    if (user !== null) throw new AlreadyExists(`Ya existe una casa con el nombre ${house.nombreCasa}`);

   //    const userNewHouse: User | null = await this.userModel
   //       .findByIdAndUpdate(
   //          userId,
   //          { $push: { casas: house } },
   //          { new: true }
   //       )
   //       .select('-casas.sensores.historial -casas.camaras.historial')
   //       .lean();
      
   //    return userNewHouse;
   // }

   // async getOne (houseId: string, userId: string): Promise<Casa | null> {
   //    const user = await this.userModel
   //       .findOne({ _id: userId, 'casas._id': houseId })
   //       .select('-casas.sensores.historial -casas.camaras.historial')
   //       .lean();

   //    if (user === null) throw new NotFound('Casa no encontrada');
      
   //    const house = user.casas.find(house => house._id.toString() === houseId);

   //    return house ?? null;
   // }

   // async update (houseId: string, userId: string, houseBody: Casa): Promise<Casa> {
   //    const house = await this.getOne(houseId, userId);

   //    if (house === null) throw new NotFound('Casa no encontrada');
      
   //    const updatedHouse = merge({}, house, houseBody);

   //    const user = await this.userModel.findOneAndUpdate(
   //       { _id: userId, 'casas._id': houseId },
   //       { $set: { 'casas.$': updatedHouse } },
   //       { new: true }
   //    ).select('-casas.sensores.historial -casas.camaras.historial -casas.central.historial');

   //    const responseHouse = user?.casas.find(house => house._id.toString() === houseId);

   //    if (responseHouse === undefined) throw new NotFound('Casa no encontrada');

   //    return responseHouse;
   // }

   // async delete (houseId: string, userId: string): Promise<void> {
   //    const user = await this.userModel.findOneAndUpdate(
   //       { _id: userId, 'casas._id': houseId },
   //       { $pull: { casas: { _id: houseId } } },
   //       { new: true }
   //    );

   //    if (user === null) throw new NotFound('Casa no encontrada');
   // }
}
