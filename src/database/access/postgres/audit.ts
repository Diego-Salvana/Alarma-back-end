import { and, desc, eq, gte, lte, type SQL } from 'drizzle-orm';

import { getPostgresDb } from './db';
import { auditLogs, type AuditLogRow } from '../../models/postgres/schema';
import { AuditLogEntry, AuditLogFilters, AuditLogInput, IAuditDataAccess } from '../../../interfaces';

export class AuditDataAccess implements IAuditDataAccess {
  async log (entry: AuditLogInput): Promise<AuditLogEntry> {
    const [row] = await getPostgresDb().insert(auditLogs).values({
      adminId: entry.adminId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      details: entry.details ?? null
    }).returning();

    return this.toDomain(row);
  }

  async list (filters: AuditLogFilters): Promise<AuditLogEntry[]> {
    const conditions: SQL[] = [];

    if (filters.adminId) conditions.push(eq(auditLogs.adminId, filters.adminId));
    if (filters.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));
    if (filters.from) conditions.push(gte(auditLogs.createdAt, filters.from));
    if (filters.to) conditions.push(lte(auditLogs.createdAt, filters.to));

    const limit = Math.min(filters.limit ?? 50, 200);
    const offset = filters.offset ?? 0;

    const rows = await getPostgresDb()
      .select()
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map(row => this.toDomain(row));
  }

  private toDomain (row: AuditLogRow): AuditLogEntry {
    return {
      id: row.id,
      adminId: row.adminId,
      action: row.action as AuditLogEntry['action'],
      entityType: row.entityType as AuditLogEntry['entityType'],
      entityId: row.entityId,
      details: row.details,
      createdAt: row.createdAt
    };
  }
}
