import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as schema from '../../models/postgres/schema';

let pool: Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

/** Singleton Drizzle sobre `pg.Pool`. Usa el pooler Supabase (6543) en runtime. */
export function getPostgresDb (): NodePgDatabase<typeof schema> {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.SUPA_DATABASE_URL ?? '';

  if (!connectionString) throw new Error('SUPA_DATABASE_URL not configured');

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  dbInstance = drizzle(pool, { schema });

  return dbInstance;
}

/** Verifica conectividad (SELECT 1). No tumba Mongo si falla: loguea y sigue. */
export async function connectPostgres (): Promise<void> {
  try {
    const db = getPostgresDb();
    await db.execute('select 1');
    console.log('Connected to PostgreSQL 🐘');
  } catch {
    console.log('Failed to connect to PostgreSQL (continuing with MongoDB only)');
  }
}
