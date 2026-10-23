import { Admin, AuditAction, AuditEntityType, AuditLogEntry, CreateAdmin, Register, User } from './domain.interfaces';

export interface IUserDataAccess {
  create(userBody: RegisterDB): Promise<void>;
  getOne(email: string): Promise<User>;
  getById(id: string): Promise<User>;
  getAll(): Promise<User[]>;
  updateInfo(id: string, updateBody: Partial<User>): Promise<User>;
  updateSystemData(id: string, updateBody: Partial<User>): Promise<User>;
  updatePassword(id: string, oldHash: string, newHash: string): Promise<void>;
  emailVerification(username: string): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface RegisterDB extends Register {
  username: string;
  enabled: boolean;
}

export interface IAdminDataAccess {
  create(admin: CreateAdmin & { password: string }): Promise<Admin>;
  getByEmailWithPassword(email: string): Promise<Admin>;
  getById(id: string): Promise<Admin>;
  getAll(): Promise<Admin[]>;
  updateInfo(id: string, update: Partial<Pick<Admin, 'firstName' | 'lastName' | 'role'>>): Promise<Admin>;
  updatePassword(id: string, newHash: string): Promise<Admin>;
  deactivate(id: string): Promise<void>;
}

export interface AuditLogInput {
  adminId: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
}

export interface AuditLogFilters {
  adminId?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface IAuditDataAccess {
  log(entry: AuditLogInput): Promise<AuditLogEntry>;
  list(filters: AuditLogFilters): Promise<AuditLogEntry[]>;
}
