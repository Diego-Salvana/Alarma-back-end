import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/access/postgres/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // Migraciones y seed usan la conexión directa (puerto 5432).
    url: process.env.SUPA_DIRECT_URL ?? process.env.SUPA_DATABASE_URL ?? ''
  }
});
