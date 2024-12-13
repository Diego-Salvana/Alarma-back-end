import { ObjectId } from 'mongoose';
import { IUserDocument, LoginResponse, User } from '../interfaces';
import { JWTHandler } from '../utils';

export class UserDTO {
   loginResponse (user: IUserDocument | User): LoginResponse {
      const token = JWTHandler.generateToken({
         id: user._id as string,
         nombreUsuario: user.nombreUsuario,
         mosquittoPass: user.mosquittoPass
      });

      const responseUser: LoginResponse = {
         id: user._id as ObjectId,
         nombre: user.nombre,
         apellido: user.apellido,
         nombreUsuario: user.nombreUsuario,
         email: user.email,
         mosquittoPass: user.mosquittoPass,
         habilitado: user.habilitado,
         token,
         casas: user.casas
      };

      return responseUser;
   }
}
