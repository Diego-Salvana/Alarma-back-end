import { IUserDataAccess, JwtPayloadExt, Login, LoginResponse, ProfileResponse, Purpose, Register, RegisterDB, UpdateUser } from '../interfaces';
import { BadRequest, encrypt, JwtHandler, Unauthorized, verifyPass } from '../utils';
import { EmailService } from './email';
import { UserDto } from './user-dto';
import { Types } from 'mongoose';

/** Servicio que administra operaciones con la base de datos y la lógica de negocio de Usuarios. */
export class UserService {
  private userDTO = new UserDto();
  private userPrefix = process.env.USER_PREFIX;

  constructor (private userDataAccess: IUserDataAccess, private emailService: EmailService) {}

  /** Crea un nuevo usuario y envía un correo de verificación. */
  async create (body: Register): Promise<void> {
    const passwordHash = await encrypt(body.contrasena);
    const userData = { ...body, contrasena: passwordHash };

    if (!this.userPrefix) throw new Error('Prefix de usuario no configurado');
    
    const registerBody: RegisterDB = {
      ...userData,
      nombreUsuario: `${this.userPrefix}${body.email}`,
      mosquittoPass: '-',
      habilitado: false,
      casas: []
    };
    const token = JwtHandler.generateUsernameToken(
      registerBody.nombreUsuario, Purpose.EMAIL_VERIFICATION
    );
    
    await this.userDataAccess.create(registerBody);
    await this.emailService.sendVerificationEmail(body.email, token);
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

  /** Verifica el correo del usuario y devuelve un token de sesión. */
  async verifyEmail (token: string): Promise<string> {
    let payload: JwtPayloadExt;

    try {
      payload = JwtHandler.verifyToken(token) as JwtPayloadExt;
    } catch (err) {
      throw new BadRequest('Token inválido');
    }

    const { username, purpose } = payload;
    if (!username) throw new BadRequest('Token inválido');
    if (purpose !== Purpose.EMAIL_VERIFICATION) throw new Unauthorized('Tipo de token no válido');
    
    const user = await this.userDataAccess.updateEmailVerification(username);
    const id = (user._id as Types.ObjectId).toString();
    const sesionToken = JwtHandler.generateIdToken({ userId: id, houseId: '', verified: true });
    
    return sesionToken;
  }

  /** Solicita restablecimiento de contraseña y envía un email con un token. */
  async forgotPassword (email: string): Promise<void> {
    const user = await this.userDataAccess.getOne(email);
    const token = JwtHandler.generateUsernameToken(user.nombreUsuario, Purpose.PASSWORD_RESET);
    
    await this.emailService.sendResetPassEmail(email, token);
  }

  /** Restablece la contraseña del usuario. */
  async resetPassword (token: string, password: string): Promise<string> {
    let payload: JwtPayloadExt;

    try {
      payload = JwtHandler.verifyToken(token) as JwtPayloadExt;
    } catch (err) {
      throw new BadRequest('Token inválido');
    }

    const { username, purpose } = payload;
    if (!username) throw new BadRequest('Token inválido');
    if (purpose !== Purpose.PASSWORD_RESET) throw new Unauthorized('Tipo de token no válido');

    const email = username.split(this.userPrefix ?? '-')[1];
    const user = await this.userDataAccess.getOne(email);
    const userId = (user._id as Types.ObjectId).toString();
    const verified = user.habilitado;
    const hashedPassword = user.contrasena;
    const newHash = await encrypt(password);

    await this.userDataAccess.updatePassword(userId, hashedPassword, newHash);

    const sesionToken = JwtHandler.generateIdToken({ userId, houseId: '', verified });
    
    return sesionToken;
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
}
