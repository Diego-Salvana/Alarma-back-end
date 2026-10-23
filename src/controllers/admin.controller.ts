import { Request, Response } from 'express';

import { AdminService, AuditService } from '../services';
import { RequestExt } from '../interfaces';
import { UnauthorizedError, ValidationError } from '../errors';
import { sendSuccess } from '../utils';
import type { AuditAction, AuditEntityType } from '../interfaces';

const AUDIT_ACTIONS: AuditAction[] = [
  'ADMIN_LOGIN', 'CREATE_ADMIN', 'UPDATE_ADMIN', 'DEACTIVATE_ADMIN',
  'UPDATE_USER', 'DELETE_USER',
  'CREATE_HOUSE', 'UPDATE_HOUSE', 'DELETE_HOUSE',
  'CREATE_SENSOR', 'UPDATE_SENSOR', 'DELETE_SENSOR'
];
const AUDIT_ENTITY_TYPES: AuditEntityType[] = ['admin', 'user', 'house', 'sensor', 'auth'];

function requireAdminId (req: RequestExt): string {
  if (!req.admin?.sub) throw new UnauthorizedError('Missing admin ID in token');

  return req.admin.sub;
}

export class AdminController {
  constructor (
    private adminService: AdminService,
    private auditService: AuditService
  ) {}

  // -------------------
  // Auth + identidad
  // -------------------
  async login ({ body }: Request, res: Response) {
    const { email, password } = body;
    const response = await this.adminService.login(email, password);

    sendSuccess(res, 200, 'Login successful', response);
  }

  async getMe (req: RequestExt, res: Response) {
    const adminId = requireAdminId(req);
    const admin = await this.adminService.getById(adminId);

    sendSuccess(res, 200, 'Admin retrieved successfully', admin);
  }

  // -------------------
  // Admins (rutas protegidas con requireSuperadmin)
  // -------------------
  async getAllAdmins (_req: Request, res: Response) {
    const admins = await this.adminService.getAll();

    sendSuccess(res, 200, 'Admins retrieved successfully', admins);
  }

  async getAdmin ({ params }: Request, res: Response) {
    const admin = await this.adminService.getById(params.adminId);

    sendSuccess(res, 200, 'Admin retrieved successfully', admin);
  }

  async createAdmin (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    const admin = await this.adminService.create(actorId, req.body);

    sendSuccess(res, 201, 'Admin created successfully', admin);
  }

  async updateAdmin (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    const admin = await this.adminService.update(actorId, req.params.adminId, req.body);

    sendSuccess(res, 200, 'Admin updated successfully', admin);
  }

  async deactivateAdmin (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    await this.adminService.deactivate(actorId, req.params.adminId);

    res.status(204).send();
  }

  // -------------------
  // Auditoría (solo lectura)
  // -------------------
  async getAuditLogs ({ query }: Request, res: Response) {
    const { adminId, action, entityType, from, to, limit, offset } = query as Record<string, string | undefined>;

    if (action !== undefined && !(AUDIT_ACTIONS as string[]).includes(action)) {
      throw new ValidationError('Invalid audit action filter');
    }
    if (entityType !== undefined && !(AUDIT_ENTITY_TYPES as string[]).includes(entityType)) {
      throw new ValidationError('Invalid audit entity type filter');
    }

    const logs = await this.auditService.list({
      ...(adminId && { adminId }),
      ...(action && { action: action as AuditAction }),
      ...(entityType && { entityType: entityType as AuditEntityType }),
      ...(from && { from: new Date(from) }),
      ...(to && { to: new Date(to) }),
      ...(limit && { limit: parseInt(limit) }),
      ...(offset && { offset: parseInt(offset) })
    });

    sendSuccess(res, 200, 'Audit logs retrieved successfully', logs);
  }

  // -------------------
  // Operativa (delega a AdminService: Mongo + auditoría)
  // -------------------
  async getAllUsers (_req: Request, res: Response) {
    const users = await this.adminService.getAllUsers();

    sendSuccess(res, 200, 'Users retrieved successfully', users);
  }

  async getUser ({ params }: Request, res: Response) {
    const user = await this.adminService.getUser(params.userId);

    sendSuccess(res, 200, 'User retrieved successfully', user);
  }

  async modifyUser (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    const user = await this.adminService.updateUserAsAdmin(actorId, req.params.userId, req.body);

    sendSuccess(res, 200, 'User updated successfully', user);
  }

  async deleteUser (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    await this.adminService.deleteUserAsAdmin(actorId, req.params.userId);

    res.status(204).send();
  }

  async createHouse (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    await this.adminService.createHouseAsAdmin(actorId, req.params.userId, req.body);

    sendSuccess(res, 201, 'House created successfully', null);
  }

  async modifyHouse (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    const { userId, houseId } = req.params;
    const house = await this.adminService.updateHouseAsAdmin(actorId, userId, houseId, req.body);

    sendSuccess(res, 200, 'House updated successfully', house);
  }

  async deleteHouse (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    const { userId, houseId } = req.params;

    await this.adminService.deleteHouseAsAdmin(actorId, userId, houseId);

    res.status(204).send();
  }

  async createSensor (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    const { userId, houseId } = req.params;
    const newSensor = await this.adminService.createSensorAsAdmin(actorId, userId, houseId, req.body);

    sendSuccess(res, 201, 'Sensor added', newSensor);
  }

  async updateSensor (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    const { userId, houseId, sensorNumber } = req.params;
    const sensorId = parseInt(sensorNumber);

    if (isNaN(sensorId)) throw new ValidationError('Invalid sensor number');

    const updatedSensor = await this.adminService.updateSensorAsAdmin(actorId, userId, houseId, sensorId, req.body);

    sendSuccess(res, 200, 'Sensor updated successfully', updatedSensor);
  }

  async deleteSensor (req: RequestExt, res: Response) {
    const actorId = requireAdminId(req);
    const { userId, houseId, sensorNumber } = req.params;
    const sensorId = parseInt(sensorNumber);

    if (isNaN(sensorId)) throw new ValidationError('Invalid sensor number');

    await this.adminService.deleteSensorAsAdmin(actorId, userId, houseId, sensorId);

    res.status(204).send();
  }
}
