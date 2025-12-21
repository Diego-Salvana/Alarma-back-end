import { IUserDataAccess, Login, LoginResponse, ProfileResponse, Register, RegisterDB, UpdateUser } from '../interfaces';
import { encrypt, NotFound, Unauthorized, verify } from '../utils';
import { UserDTO } from './user-dto';

/** Servicio que administra operaciones con la base de datos y la lógica de negocio de Usuarios. */
export class UserService {
  private userDTO = new UserDTO();

  constructor (private userDataAccess: IUserDataAccess) {}

  async create (body: Register): Promise<LoginResponse> {
    const passwordHash = await encrypt(body.contrasena);
    const userData = { ...body, contrasena: passwordHash };

    const registerBody: RegisterDB = {
      ...userData,
      nombreUsuario: `user_${body.email}`,
      mosquittoPass: 'creandoMosquittoPass',
      habilitado: false,
      casas: []
    };

    const newUser = await this.userDataAccess.create(registerBody);
    const responseUser = this.userDTO.loginResponse(newUser);

    return responseUser;
  }

  async login ({ email, contrasena }: Login): Promise<LoginResponse> {
    const user = await this.userDataAccess.getOne(email);

    if (user === null) {
      throw new NotFound('Usuario no encontrado');
    }

    const hashedPassword = user.contrasena;
    const passwordIsCorrect = await verify(contrasena, hashedPassword);

    if (!passwordIsCorrect) {
      throw new Unauthorized('Usuario o contraseña no válidos');
    }

    const responseUser = this.userDTO.loginResponse(user);

    return responseUser;
  }

  async getById (id: string): Promise<ProfileResponse> {
    const user = await this.userDataAccess.getById(id);
      
    if (user === null) {
      throw new NotFound('Usuario no encontrado');
    }

    const responseUser = this.userDTO.profileResponse(user);

    return responseUser;
  }

  async update (id: string, body: UpdateUser): Promise<ProfileResponse> {
    const user = await this.userDataAccess.getById(id);

    if (user === null) {
      throw new NotFound('Usuario no encontrado');
    }

    if (body.contrasenaActual && body.nuevaContrasena) {
      const hashedPassword = user.contrasena;
      const passwordIsCorrect = await verify(body.contrasenaActual, hashedPassword);

      if (!passwordIsCorrect) {
        throw new Unauthorized('Contraseña actual incorrecta');
      } else {
        body = { ...body, contrasena: await encrypt(body.nuevaContrasena) };
      }
    }

    const updatedUser = await this.userDataAccess.update(id, body);

    if (updatedUser === null) {
      throw new NotFound('Usuario para actualizar no encontrado');
    }

    const responseUser = this.userDTO.profileResponse(updatedUser);

    return responseUser;
  }

  async delete (id: string): Promise<void> {
    const user = await this.userDataAccess.delete(id);

    if (user === null) {
      throw new NotFound('Usuario no encontrado');
    }
  }
}
