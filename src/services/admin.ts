import { AdminDto } from '../dtos';
import {
  AdminLoginResponse, AdminResponse, CreateAdmin, CreateHouseInfo, CreateSensorDTO,
  HouseResponse, HouseSystemInfoDTO, IAdminDataAccess, ProfileResponse,
  SensorSystemInfoDTO, UserSystemInfoDTO, DeviceResponse
} from '../interfaces';
import { encrypt, JwtHandler, verifyPass } from '../utils';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../errors';
import { AuditService } from './audit';
import type { HouseService } from './house';
import type { SensorService } from './sensor';
import type { UserService } from './user';

export class AdminService {
  private adminDto = new AdminDto();

  constructor (
    private adminDataAccess: IAdminDataAccess,
    private auditService: AuditService,
    private userService?: UserService,
    private houseService?: HouseService,
    private sensorService?: SensorService
  ) {}

  async login (email: string, password: string): Promise<AdminLoginResponse> {
    let admin;
    try {
      admin = await this.adminDataAccess.getByEmailWithPassword(email);
    } catch (err) {
      // Email inexistente → 401 genérico (no revela qué falló).
      // Errores de infraestructura (PG caído) → 500 via errorHandler.
      if (err instanceof NotFoundError) throw new UnauthorizedError('Invalid credentials');
      throw err;
    }

    const passwordIsCorrect = await verifyPass(password, admin.password);
    if (!passwordIsCorrect) throw new UnauthorizedError('Invalid credentials');
    if (!admin.isActive) throw new ForbiddenError('Admin account is deactivated');

    const token = JwtHandler.generateAdminToken(admin.id, admin.role);

    await this.auditService.log(admin.id, 'ADMIN_LOGIN', 'auth', admin.id, null);

    return this.adminDto.loginResponse(admin, token);
  }

  async getById (id: string): Promise<AdminResponse> {
    const admin = await this.adminDataAccess.getById(id);

    return this.adminDto.toResponse(admin);
  }

  async getAll (): Promise<AdminResponse[]> {
    const admins = await this.adminDataAccess.getAll();

    return admins.map(admin => this.adminDto.toResponse(admin));
  }

  async create (
    actorId: string,
    body: CreateAdmin
  ): Promise<AdminResponse> {
    const passwordHash = await encrypt(body.password);
    const created = await this.adminDataAccess.create({ ...body, password: passwordHash });

    await this.auditService.log(actorId, 'CREATE_ADMIN', 'admin', created.id, {
      after: { id: created.id, email: created.email, role: created.role }
    });

    return this.adminDto.toResponse(created);
  }

  async update (
    actorId: string,
    id: string,
    body: Partial<Pick<CreateAdmin, 'firstName' | 'lastName' | 'role'> & { password: string }>
  ): Promise<AdminResponse> {
    const before = await this.adminDataAccess.getById(id);

    let updated = before;
    const { password, ...info } = body;

    if (Object.keys(info).length > 0) {
      updated = await this.adminDataAccess.updateInfo(id, info);
    }

    if (password !== undefined) {
      const newHash = await encrypt(password);
      updated = await this.adminDataAccess.updatePassword(id, newHash);
    }

    await this.auditService.log(actorId, 'UPDATE_ADMIN', 'admin', id, {
      before: { firstName: before.firstName, lastName: before.lastName, role: before.role },
      after: { firstName: updated.firstName, lastName: updated.lastName, role: updated.role }
    });

    return this.adminDto.toResponse(updated);
  }

  async deactivate (actorId: string, id: string): Promise<void> {
    const before = await this.adminDataAccess.getById(id);
    await this.adminDataAccess.deactivate(id);

    await this.auditService.log(actorId, 'DEACTIVATE_ADMIN', 'admin', id, {
      before: { email: before.email, isActive: before.isActive },
      after: { email: before.email, isActive: false }
    });
  }

  // -------------------
  // Operativa sobre dominio User/House/Sensor (Mongo primero, auditoría después)
  // -------------------
  private requireOperational (): { users: UserService; houses: HouseService; sensors: SensorService } {
    if (!this.userService || !this.houseService || !this.sensorService) {
      throw new Error('AdminService operational dependencies not configured');
    }

    return { users: this.userService, houses: this.houseService, sensors: this.sensorService };
  }

  async getAllUsers (): Promise<ProfileResponse[]> {
    return await this.requireOperational().users.getAllUsers();
  }

  async getUser (userId: string): Promise<ProfileResponse> {
    return await this.requireOperational().users.getById(userId);
  }

  async updateUserAsAdmin (
    actorId: string, userId: string, body: Partial<UserSystemInfoDTO>
  ): Promise<ProfileResponse> {
    const { users } = this.requireOperational();
    const before = await users.getById(userId);
    const after = await users.updateInfoByAdmin(userId, body as any);

    await this.auditService.log(actorId, 'UPDATE_USER', 'user', userId, { before, after });

    return after;
  }

  async deleteUserAsAdmin (actorId: string, userId: string): Promise<void> {
    const { users } = this.requireOperational();
    const before = await users.getById(userId);
    await users.delete(userId);

    await this.auditService.log(actorId, 'DELETE_USER', 'user', userId, { before });
  }

  async createHouseAsAdmin (
    actorId: string, userId: string, body: CreateHouseInfo
  ): Promise<void> {
    const { houses } = this.requireOperational();
    await houses.create(userId, body);

    await this.auditService.log(actorId, 'CREATE_HOUSE', 'house', null, {
      after: { userId, ...body }
    });
  }

  async updateHouseAsAdmin (
    actorId: string, userId: string, houseId: string, body: HouseSystemInfoDTO
  ): Promise<HouseResponse> {
    const { houses } = this.requireOperational();
    const before = await houses.getOne(userId, houseId, true, false);
    const after = await houses.updateInfoByAdmin(userId, houseId, body as any);

    await this.auditService.log(actorId, 'UPDATE_HOUSE', 'house', houseId, { before, after });

    return after;
  }

  async deleteHouseAsAdmin (actorId: string, userId: string, houseId: string): Promise<void> {
    const { houses } = this.requireOperational();
    const before = await houses.getOne(userId, houseId, true, false);
    await houses.delete(userId, houseId);

    await this.auditService.log(actorId, 'DELETE_HOUSE', 'house', houseId, { before });
  }

  async createSensorAsAdmin (
    actorId: string, userId: string, houseId: string, body: CreateSensorDTO
  ): Promise<Partial<DeviceResponse>> {
    const { sensors } = this.requireOperational();
    const created = await sensors.create(userId, houseId, body);

    await this.auditService.log(actorId, 'CREATE_SENSOR', 'sensor', null, {
      after: { userId, houseId, ...created }
    });

    return created;
  }

  async updateSensorAsAdmin (
    actorId: string, userId: string, houseId: string, sensorNumber: number, body: SensorSystemInfoDTO
  ): Promise<DeviceResponse> {
    const { sensors } = this.requireOperational();
    const before = await sensors.getOne(userId, houseId, sensorNumber);
    const after = await sensors.updateInfo(userId, houseId, sensorNumber, body);

    await this.auditService.log(actorId, 'UPDATE_SENSOR', 'sensor', String(sensorNumber), { before, after });

    return after;
  }

  async deleteSensorAsAdmin (
    actorId: string, userId: string, houseId: string, sensorNumber: number
  ): Promise<void> {
    const { sensors } = this.requireOperational();
    const before = await sensors.getOne(userId, houseId, sensorNumber);
    await sensors.delete(userId, houseId, sensorNumber);

    await this.auditService.log(actorId, 'DELETE_SENSOR', 'sensor', String(sensorNumber), { before });
  }
}
