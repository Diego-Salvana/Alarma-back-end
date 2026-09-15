import { EmailService } from './email';
import { UserDto } from '../dtos';
import { HouseDataAccess } from '../database/access';
import { IUserDataAccess, LoginResponse, ProfileResponse, Purpose, RegisterDB, UpdateUserDTO, Register, User, House } from '../interfaces';
import { encrypt, isDemoUser, JwtHandler, verifyPass } from '../utils';
import { UnauthorizedError, ForbiddenError } from '../errors';

export class UserService {
  private userDTO = new UserDto();
  private userPrefix = process.env.USER_PREFIX;

  constructor (
    private userDataAccess: IUserDataAccess,
    private emailService: EmailService,
    private houseDataAccess: HouseDataAccess
  ) {}

  async create (userInfo: Register): Promise<void> {
    const passwordHash = await encrypt(userInfo.password);
    const userData = { ...userInfo, password: passwordHash };

    if (!this.userPrefix) throw new Error('User prefix not configured');

    const registerBody: RegisterDB = {
      ...userData,
      username: `${this.userPrefix}${userInfo.email}`,
      enabled: false
    };
    const token = JwtHandler.generateUsernameToken(
      registerBody.username,
      Purpose.EMAIL_VERIFICATION
    );

    await this.userDataAccess.create(registerBody);
    await this.emailService.sendVerificationEmail(userInfo.email, token);
  }

  /** Autentica un administrador (deshabilitado: admin vive en otra DB futura). */
  async adminLogin (email: string, password: string): Promise<LoginResponse> {
    const user = await this.userDataAccess.getOne(email);
    const hashedPassword = user.password;
    const passwordIsCorrect = await verifyPass(password, hashedPassword);

    if (!passwordIsCorrect) throw new UnauthorizedError('Invalid credentials');

    throw new UnauthorizedError('Admin login disabled in this stage');
  }

  async login (email: string, password: string): Promise<LoginResponse> {
    const user = await this.userDataAccess.getOne(email);
    const hashedPassword = user.password;
    const passwordIsCorrect = await verifyPass(password, hashedPassword);

    if (!passwordIsCorrect) throw new UnauthorizedError('Invalid credentials');

    const houses = await this.getUserHouses(user._id);
    const houseId = houses[0]?._id;
    const sessionToken = JwtHandler.generateUserIdToken(user._id, user.enabled, houseId);
    const responseUser = this.userDTO.loginResponse(user, sessionToken, houses);

    return responseUser;
  }

  async getById (id: string): Promise<ProfileResponse> {
    const user = await this.userDataAccess.getById(id);
    const houses = await this.getUserHouses(id);
    const responseUser = this.userDTO.profileResponse(user, houses);

    return responseUser;
  }

  async getAllUsers () {
    const users = await this.userDataAccess.getAll();
    const responseUsers = await Promise.all(
      users.map(async user => this.userDTO.profileResponse(user, await this.getUserHouses(user._id)))
    );

    return responseUsers;
  }

  /** Actualiza datos y/o contraseña de un usuario y devuelve su `ProfileResponse`. */
  async update (id: string, userInfo: UpdateUserDTO): Promise<ProfileResponse> {
    const user = await this.userDataAccess.getById(id);
    const { currentPassword, newPassword, ...safeBody } = userInfo as any;
    const safeBodyIsEmpty = Object.keys(safeBody).length === 0;
    let houses = await this.getUserHouses(id);
    let responseUser = this.userDTO.profileResponse(user, houses);

    if (currentPassword && newPassword) {
      const hashedPassword = user.password;
      const passwordIsCorrect = await verifyPass(currentPassword, hashedPassword);

      if (!passwordIsCorrect) throw new UnauthorizedError('Current password is incorrect');

      const newHash = await encrypt(newPassword);
      await this.userDataAccess.updatePassword(id, hashedPassword, newHash);
    }

    if (!safeBodyIsEmpty) {
      const updatedUser = await this.userDataAccess.updateInfo(id, safeBody);
      houses = await this.getUserHouses(id);
      responseUser = this.userDTO.profileResponse(updatedUser, houses);
    }

    return responseUser;
  }

  /** Actualización de información de un usuario por un Administrador. */
  async updateInfoByAdmin (userId: string, body: Partial<User>): Promise<ProfileResponse> {
    const updatedUser = await this.userDataAccess.updateSystemData(userId, body);
    const houses = await this.getUserHouses(userId);
    const responseUser = this.userDTO.profileResponse(updatedUser, houses);

    return responseUser;
  }
  
  async delete (id: string): Promise<void> {
    await this.userDataAccess.delete(id);
  }

  async sendVerificationEmail (email: string): Promise<void> {
    const user = await this.userDataAccess.getOne(email);
    const token = JwtHandler.generateUsernameToken(user.username, Purpose.EMAIL_VERIFICATION);

    await this.emailService.sendVerificationEmail(email, token);
  }

  async verifyEmail (username: string, purpose: Purpose): Promise<string> {
    if (purpose !== Purpose.EMAIL_VERIFICATION) throw new UnauthorizedError('Invalid token type');

    const email = username.split(this.userPrefix ?? '-')[1];
    const userToVerify = await this.userDataAccess.getOne(email);
    
    if (isDemoUser(userToVerify._id)) {
      throw new ForbiddenError('Action not available for demo user');
    }

    const user = await this.userDataAccess.emailVerification(username);
    const id = user._id;
    const sessionToken = JwtHandler.generateUserIdToken(id, user.enabled);

    return sessionToken;
  }

  /** Solicita restablecimiento de contraseña y envía un email con un token. */
  async forgotPassword (email: string): Promise<void> {
    const user = await this.userDataAccess.getOne(email);
    
    if (isDemoUser(user._id)) {
      throw new ForbiddenError('Action not available for demo user');
    }
    const token = JwtHandler.generateUsernameToken(user.username, Purpose.PASSWORD_RESET);

    await this.emailService.sendResetPassEmail(email, token);
  }

  /** Restablece la contraseña del usuario. */
  async resetPassword (username: string, purpose: Purpose, password: string): Promise<string> {
    if (purpose !== Purpose.PASSWORD_RESET) throw new UnauthorizedError('Invalid token type');

    const email = username.split(this.userPrefix ?? '-')[1];
    const user = await this.userDataAccess.getOne(email);
    
    if (isDemoUser(user._id)) {
      throw new ForbiddenError('Action not available for demo user');
    }
    
    const userId = user._id;
    const verified = user.enabled;
    const houses = await this.getUserHouses(userId);
    const firstHouseId = houses[0]?._id;
    const hashedPassword = user.password;
    const newHash = await encrypt(password);

    await this.userDataAccess.updatePassword(userId, hashedPassword, newHash);

    const sessionToken = JwtHandler.generateUserIdToken(userId, verified, firstHouseId);

    return sessionToken;
  }

  private async getUserHouses (userId: string): Promise<House[]> {
    return await this.houseDataAccess.getAllByUserId(userId);
  }
}
