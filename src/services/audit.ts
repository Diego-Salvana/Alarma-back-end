import { AdminDto } from '../dtos';
import { AuditLogFilters, AuditLogResponse, IAuditDataAccess } from '../interfaces';
import type { AuditAction, AuditEntityType } from '../interfaces';

export class AuditService {
  private adminDto = new AdminDto();

  constructor (private auditDataAccess: IAuditDataAccess) {}

  /**
   * Registra una mutación. Best-effort: si Postgres falla, no rompe la
   * operación principal (Mongo primero, Postgres después). Evolución futura: Outbox.
   */
  async log (
    adminId: string | null,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId?: string | null,
    details?: Record<string, unknown> | null
  ): Promise<void> {
    try {
      await this.auditDataAccess.log({
        adminId,
        action,
        entityType,
        entityId: entityId ?? null,
        details: (this.adminDto.sanitizeForAudit(details ?? null) as Record<string, unknown> | null)
      });
    } catch (err) {
      console.error('Audit log failed (non-blocking):', err);
    }
  }

  async list (filters: AuditLogFilters): Promise<AuditLogResponse[]> {
    const entries = await this.auditDataAccess.list(filters);

    return entries.map(entry => this.adminDto.auditResponse(entry));
  }
}
