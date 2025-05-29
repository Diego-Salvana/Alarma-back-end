import { merge } from 'lodash';
import { Casa, Estado, ExclusionSensor, User } from '../interfaces';
import { AlreadyExists, BadRequest, NotFound } from '../utils';
import { UserModel } from './user';

export class HouseDataAccess {
   private userModel = UserModel;
   private withoutHistory = '-casas.central.historial -casas.sensores.historial -casas.camaras.historial';

   async create (userId: string, house: Casa): Promise<User | null> {
      const user = await this.userModel.findOne({ _id: userId, 'casas.nombre': house.nombre });

      if (user !== null) throw new AlreadyExists(`Ya existe una casa con el nombre: ${house.nombre}`);

      const userNewHouse: User | null = await this.userModel
         .findByIdAndUpdate(
            userId,
            { $push: { casas: house } },
            { new: true }
         )
         .select(this.withoutHistory)
         .lean();
      
      return userNewHouse;
   }
   
   async getAllByUserId (userId: string): Promise<Array<Pick<Casa, '_id' | 'nombre' | 'direccion' | 'central'>>> {
      const user = await this.userModel
         .findById(userId)
         .select('casas._id casas.nombre casas.direccion casas.central.alarmaEncendida')
         .lean();

      if (user === null) throw new NotFound('Casas no encontradas');

      const houses = user.casas.map(casa => ({
         _id: casa._id.toString(),
         nombre: casa.nombre,
         direccion: casa.direccion,
         central: casa.central
      }));
      
      return houses;
   }

   async getOne (houseId: string, userId: string, withHistory = false): Promise<Casa | null> {
      const user = await this.userModel
         .findOne({ _id: userId, 'casas._id': houseId })
         .select(withHistory ? '' : this.withoutHistory)
         .lean();

      if (user === null) throw new NotFound('Casa no encontrada');
      
      const house = user.casas.find(house => house._id.toString() === houseId);
      
      return house ?? null;
   }

   async update (houseId: string, userId: string, houseBody: Partial<Casa>): Promise<Casa> {
      const house = await this.getOne(houseId, userId, true);

      if (house === null) throw new NotFound('Casa no encontrada');
      
      const updatedHouseData = merge({}, house, houseBody);

      const user = await this.userModel.findOneAndUpdate(
         { _id: userId, 'casas._id': houseId },
         { $set: { 'casas.$': updatedHouseData } },
         { new: true }
      ).select(this.withoutHistory).lean(); // Revisar

      if (user === null) throw new NotFound('Usuario o casa no encontrados durante la actualización');
      const responseHouse = user.casas.find(house => house._id.toString() === houseId);

      if (responseHouse === undefined) throw new NotFound('Casa no encontrada después de la actualización');

      return responseHouse;
   }

   async delete (houseId: string, userId: string): Promise<void> {
      const user = await this.userModel.findOneAndUpdate(
         { _id: userId, 'casas._id': houseId },
         { $pull: { casas: { _id: houseId } } },
         { new: true }
      );

      if (user === null) throw new NotFound('Casa no encontrada');
   }

   async activeAlarm (houseId: string, userId: string, exclusionArray: ExclusionSensor[]): Promise<Casa | null> {
      if (exclusionArray.length < 1) throw new BadRequest('Debe haber algún sensor activado');

      const user = await this.userModel
         .findOne({ _id: userId, 'casas._id': houseId })
         .select(this.withoutHistory);

      if (user === null) throw new NotFound('Usuario no encontrado');

      const house = user.casas.find(h => h._id.toString() === houseId);
      if (house === undefined) throw new NotFound('Casa no encontrada');

      house.sensores.forEach(sensor => {
         const state = exclusionArray.find(excObj => sensor.numeroSensor.toString() === excObj.numeroSensor)?.estado ?? Estado.APAGADO;
         sensor.estado = state;
      });

      house.central.alarmaEncendida = Estado.ENCENDIDO;

      await user.save();

      return await this.getOne(houseId, userId);
   }

   async disarmAlarm (houseId: string, userId: string): Promise<Casa | null> {
      const user = await this.userModel
         .findOne({ _id: userId, 'casas._id': houseId })
         .select(this.withoutHistory);

      if (user === null) throw new NotFound('Usuario no encontrado');

      const house = user.casas.find(h => h._id.toString() === houseId);
      if (house === undefined) throw new NotFound('Casa no encontrada');

      house.central.alarmaEncendida = Estado.APAGADO;

      await user.save();

      return await this.getOne(houseId, userId);
   }
}
