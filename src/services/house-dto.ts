import { Casa, HouseResponse, IUserDocument, User } from '../interfaces';
import { JWTHandler } from '../utils';

export class HouseDTO {
   houseResponse (house: Casa, userId: string = '', newToken: boolean = false): HouseResponse {
      let token: string | undefined;
      
      if (newToken) {
         token = JWTHandler.generateToken({ userId, houseId: house._id });
      }

      const houseData: HouseResponse = {
         _id: house._id,
         nombre: house.nombre,
         direccion: house.direccion,
         alarmaEncendida: house.central.alarmaEncendida,
         sonando: house.central.sonando,
         sensores: house.sensores,
         token
      };

      return houseData;
   }

   housesListResponse (user: IUserDocument | User): HouseResponse[] {
      return user.casas.map(casa => ({
         _id: casa._id.toString(),
         nombre: casa.nombre,
         direccion: casa.direccion,
         alarmaEncendida: casa.central.alarmaEncendida,
         sonando: casa.central.sonando,
         sensores: casa.sensores
      }));
   }
}
