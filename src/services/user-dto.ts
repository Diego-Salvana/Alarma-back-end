import { IUserDocument, LoginResponse, User } from '../interfaces';
import { JWTHandler } from '../utils';

export class UserDTO {
   loginResponse (user: IUserDocument | User): LoginResponse {
      const token = JWTHandler.generateToken({
         userId: user._id as string,
         houseId: user.casas[0] ? user.casas[0]._id : undefined
      });

      const responseUser: LoginResponse = {
         nombre: user.nombre,
         apellido: user.apellido,
         email: user.email,
         habilitado: user.habilitado,
         token,
         casas: user.casas
      };

      return responseUser;
   }
}
