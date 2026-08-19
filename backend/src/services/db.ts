import { neon } from '@neondatabase/serverless';
import { env, isDatabaseConfigured } from '../config/env.js';

export const sql = isDatabaseConfigured ? neon(env.databaseUrl) : null;

export async function healthCheckDatabase() {
  if (!sql) {
    return {
      ok: false,
      message: 'DATABASE_URL is not configured yet.',
    };
  }

  try {
    const result = await sql`SELECT 1 as ok`;
    return {
      ok: true,
      result,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Database connection failed.',
    };
  }
}
