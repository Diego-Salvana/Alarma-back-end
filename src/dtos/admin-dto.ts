import { Admin, AdminLoginResponse, AdminResponse, AuditLogEntry, AuditLogResponse } from '../interfaces';

export class AdminDto {
  /** Transforma un admin (dominio Postgres) en respuesta pública. Nunca incluye password. */
  toResponse (admin: Admin): AdminResponse {
    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };
  }

  loginResponse (admin: Admin, token: string): AdminLoginResponse {
    return { admin: this.toResponse(admin), token };
  }

  auditResponse (entry: AuditLogEntry): AuditLogResponse {
    return {
      id: entry.id,
      adminId: entry.adminId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      details: entry.details,
      createdAt: entry.createdAt
    };
  }

  /** Quita secretos de un snapshot before/after para auditoría. */
  sanitizeForAudit (value: unknown): unknown {
    if (Array.isArray(value)) return value.map(item => this.sanitizeForAudit(item));
    if (value !== null && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key.toLowerCase() !== 'password')
        .map(([key, val]): [string, unknown] => [key, this.sanitizeForAudit(val)]);

      return Object.fromEntries(entries);
    }

    return value;
  }
}
