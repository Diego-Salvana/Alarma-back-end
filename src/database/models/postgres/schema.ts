import { boolean, index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

const adminRoleEnum = pgEnum('admin_role', ['admin', 'superadmin']);

export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: adminRoleEnum('role').notNull().default('admin'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** SET NULL para conservar historia si el admin se elimina. */
  adminId: uuid('admin_id').references(() => admins.id, { onDelete: 'set null' }),
  /** Ej: ADMIN_LOGIN, CREATE_ADMIN, UPDATE_USER, DELETE_HOUSE... Solo mutaciones. */
  action: text('action').notNull(),
  /** 'admin' | 'user' | 'house' | 'sensor' | 'auth' */
  entityType: text('entity_type').notNull(),
  /** ObjectId Mongo como string o id de admin. Nullable (ej: login). */
  entityId: text('entity_id'),
  /** { before?, after? } completo sin passwords. */
  details: jsonb('details').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  index('audit_logs_admin_id_idx').on(table.adminId),
  index('audit_logs_entity_idx').on(table.entityType, table.entityId)
]);

export type AdminRow = typeof admins.$inferSelect;
export type NewAdminRow = typeof admins.$inferInsert;
export type AuditLogRow = typeof auditLogs.$inferSelect;
export type NewAuditLogRow = typeof auditLogs.$inferInsert;
