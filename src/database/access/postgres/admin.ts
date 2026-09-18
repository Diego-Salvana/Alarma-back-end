import { eq } from 'drizzle-orm';

import { getPostgresDb } from './db';
import { admins, type AdminRow } from '../../models/postgres/schema';
import { Admin, CreateAdmin, IAdminDataAccess } from '../../../interfaces';
import { ConflictError, NotFoundError } from '../../../errors';

export class AdminDataAccess implements IAdminDataAccess {
  async create (admin: CreateAdmin & { password: string }): Promise<Admin> {
    try {
      const [row] = await getPostgresDb().insert(admins).values({
        email: admin.email.toLowerCase().trim(),
        password: admin.password,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }).returning();

      return this.toDomain(row);
    } catch (err: any) {
      if (err?.code === '23505') throw new ConflictError('Admin with this email already exists');
      throw err;
    }
  }

  async getByEmailWithPassword (email: string): Promise<Admin> {
    const rows = await getPostgresDb()
      .select()
      .from(admins)
      .where(eq(admins.email, email.toLowerCase().trim()))
      .limit(1);

    if (rows.length === 0) throw new NotFoundError('Admin not found');

    return this.toDomain(rows[0]);
  }

  async getById (id: string): Promise<Admin> {
    const rows = await getPostgresDb()
      .select()
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1);

    if (rows.length === 0) throw new NotFoundError('Admin not found');

    return this.toDomain(rows[0]);
  }

  async getAll (): Promise<Admin[]> {
    const rows = await getPostgresDb().select().from(admins);

    return rows.map(row => this.toDomain(row));
  }

  async updateInfo (
    id: string,
    update: Partial<Pick<Admin, 'firstName' | 'lastName' | 'role'>>
  ): Promise<Admin> {
    const patch: Partial<typeof admins.$inferInsert> = {
      ...(update.firstName !== undefined && { firstName: update.firstName }),
      ...(update.lastName !== undefined && { lastName: update.lastName }),
      ...(update.role !== undefined && { role: update.role }),
      updatedAt: new Date()
    };

    const [row] = await getPostgresDb()
      .update(admins)
      .set(patch)
      .where(eq(admins.id, id))
      .returning();

    if (!row) throw new NotFoundError('Admin not found');

    return this.toDomain(row);
  }

  async updatePassword (id: string, newHash: string): Promise<Admin> {
    const [row] = await getPostgresDb()
      .update(admins)
      .set({ password: newHash, updatedAt: new Date() })
      .where(eq(admins.id, id))
      .returning();

    if (!row) throw new NotFoundError('Admin not found');

    return this.toDomain(row);
  }

  /** Soft-delete: conserva la fila para no romper la historia de auditoría. */
  async deactivate (id: string): Promise<void> {
    const [row] = await getPostgresDb()
      .update(admins)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(admins.id, id))
      .returning({ id: admins.id });

    if (!row) throw new NotFoundError('Admin not found');
  }

  private toDomain (row: AdminRow): Admin {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}
