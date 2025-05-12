import { HouseResponse, IUserDocument, LoginResponse, User } from '../interfaces';
import { JWTHandler } from '../utils';

export class UserDTO {
   loginResponse (user: IUserDocument | User): LoginResponse {
      const token = JWTHandler.generateToken({
         userId: user._id as string,
         houseId: user.casas[0] ? user.casas[0]._id : undefined
      });

      const casasResponse: HouseResponse[] = user.casas.map(casa => ({
         _id: casa._id.toString(),
         nombre: casa.nombre,
         direccion: casa.direccion,
         alarmaEncendida: casa.central.alarmaEncendida
      }));

      const responseUser: LoginResponse = {
         nombre: user.nombre,
         habilitado: user.habilitado,
         token,
         casas: casasResponse
      };

      return responseUser;
   }
}
