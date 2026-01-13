import { JwtPayload } from 'jsonwebtoken';
import { IUserDataAccess, Login, LoginResponse, ProfileResponse, Register, RegisterDB, UpdateUser } from '../interfaces';
import { BadRequest, encrypt, JwtHandler, Unauthorized, verifyPass } from '../utils';
import { EmailService } from './email';
import { UserDto } from './user-dto';
import { Types } from 'mongoose';

/** Servicio que administra operaciones con la base de datos y la lógica de negocio de Usuarios. */
export class UserService {
  private userDTO = new UserDto();

  constructor (private userDataAccess: IUserDataAccess, private emailService: EmailService) {}

  /** Crea un nuevo usuario y envía un correo de verificación. */
  async create (body: Register): Promise<void> {
    const passwordHash = await encrypt(body.contrasena);
    const userData = { ...body, contrasena: passwordHash };
    
    const registerBody: RegisterDB = {
      ...userData,
      nombreUsuario: `user_${body.email}`,
      mosquittoPass: '-',
      habilitado: false,
      casas: []
    };
    const token = JwtHandler.generateUsernameToken(registerBody.nombreUsuario);
    
    await this.userDataAccess.create(registerBody);
    await this.emailService.sendEmail(body.email, token);
  }

  /** Autentica un usuario y devuelve su `LoginResponse`. */
  async login ({ email, contrasena }: Login): Promise<LoginResponse> {
    const user = await this.userDataAccess.getOne(email);
    const hashedPassword = user.contrasena;
    const passwordIsCorrect = await verifyPass(contrasena, hashedPassword);

    if (!passwordIsCorrect) throw new Unauthorized('Usuario o contraseña no válidos');

    const responseUser = this.userDTO.loginResponse(user);

    return responseUser;
  }

  /** Obtiene un usuario por su ID y devuelve su `ProfileResponse`. */
  async getById (id: string): Promise<ProfileResponse> {
    const user = await this.userDataAccess.getById(id);
    const responseUser = this.userDTO.profileResponse(user);

    return responseUser;
  }

  /** Actualiza datos y/o contraseña de un usuario y devuelve su `ProfileResponse`. */
  async update (id: string, body: UpdateUser): Promise<ProfileResponse> {
    const user = await this.userDataAccess.getById(id);
    const { contrasenaActual, nuevaContrasena, ...safeBody } = body;
    const safeBodyIsEmpty = Object.keys(safeBody).length === 0;
    let responseUser = this.userDTO.profileResponse(user);

    if (contrasenaActual && nuevaContrasena) {
      const hashedPassword = user.contrasena;
      const passwordIsCorrect = await verifyPass(contrasenaActual, hashedPassword);

      if (!passwordIsCorrect) throw new Unauthorized('Contraseña actual incorrecta');

      const newHash = await encrypt(nuevaContrasena);
      await this.userDataAccess.updatePassword(id, hashedPassword, newHash);
    }

    if (!safeBodyIsEmpty) {
      const updatedUser = await this.userDataAccess.updateInfo(id, safeBody);
      responseUser = this.userDTO.profileResponse(updatedUser);
    }

    return responseUser;
  }

  /** Elimina un usuario de la base de datos. */
  async delete (id: string): Promise<void> {
    await this.userDataAccess.delete(id);
  }

  async verifyEmail (token: string): Promise<string> {
    let payload: JwtPayload;

    try {
      payload = JwtHandler.verifyToken(token) as JwtPayload;
    } catch (err) {
      throw new BadRequest('Token inválido');
    }

    const username = payload.username;
    if (!username) throw new BadRequest('Token inválido');
    
    const user = await this.userDataAccess.updateEmailVerification(username);
    const id = (user._id as Types.ObjectId).toString();
    const sesionToken = JwtHandler.generateIdToken({ userId: id, houseId: '' });
    
    return sesionToken;
  }
}
