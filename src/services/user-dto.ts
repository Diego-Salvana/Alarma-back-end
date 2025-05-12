import { Casa, HouseResponse, IUserDocument, LoginResponse, ProfileResponse, User } from '../interfaces';
import { JWTHandler } from '../utils';

export class UserDTO {
   loginResponse (user: IUserDocument | User): LoginResponse {
      const token = JWTHandler.generateToken({
         userId: user._id as string,
         houseId: user.casas[0] ? user.casas[0]._id : undefined
      });

      const casasResponse: HouseResponse[] = this.housesMap(user.casas);

      const responseUser: LoginResponse = {
         nombre: user.nombre,
         habilitado: user.habilitado,
         token,
         casas: casasResponse
      };

      return responseUser;
   }

   profileResponse (user: IUserDocument | User): ProfileResponse {
      const casasResponse: HouseResponse[] = this.housesMap(user.casas);

      const userProfile: ProfileResponse = {
         nombre: user.nombre,
         apellido: user.apellido,
         email: user.email,
         telefono: user.telefono,
         habilitado: user.habilitado,
         casas: casasResponse
      };

      return userProfile;
   };

   private housesMap (houses: Casa[]): HouseResponse[] {
      return houses.map(casa => ({
         _id: casa._id.toString(),
         nombre: casa.nombre,
         direccion: casa.direccion,
         alarmaEncendida: casa.central.alarmaEncendida
      }));
   }
}
