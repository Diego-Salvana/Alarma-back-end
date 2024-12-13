import { IUserDataAccess, Login, LoginResponse, Register } from '../interfaces';
import { NotFound } from '../utils';
import { UserDTO } from './user-dto';

export class UserService {
   private userDTO = new UserDTO();

   constructor (private userDataAccess: IUserDataAccess) {}

   async create (body: Register): Promise<LoginResponse> {
      const registerBody: Register = {
         ...body,
         nombreUsuario: `user: ${body.email}`,
         mosquittoPass: 'creandoMosquittoPass',
         habilitado: true,
         casas: []
      };

      const newUser = await this.userDataAccess.create(registerBody);
      const responseUser = this.userDTO.loginResponse(newUser);

      return responseUser;
   }

   async login (body: Login): Promise<LoginResponse> {
      const user = await this.userDataAccess.getOne(body);

      if (user === null) {
         throw new NotFound('Usuario no encontrado');
      }

      const responseUser = this.userDTO.loginResponse(user);

      return responseUser;
   }

   async update (id: string, body: Register): Promise<LoginResponse> {
      const user = await this.userDataAccess.update(id, body);

      if (user === null) {
         throw new NotFound('Usuario no encontrado');
      }

      const responseUser = this.userDTO.loginResponse(user);

      return responseUser;
   }

   async delete (id: string): Promise<void> {
      const user = await this.userDataAccess.delete(id);

      if (user === null) {
         throw new NotFound('Usuario no encontrado');
      }
   }
}
