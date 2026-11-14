import { Pool } from "pg";

/**
 * Conexión a PostgreSQL (local, Neon, Supabase, Vercel Postgres...).
 * Se reutiliza el Pool entre recargas en desarrollo.
 */
const globalForDb = globalThis as unknown as { pool?: Pool; schemaReady?: Promise<void> };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    failed_attempts INTEGER       NOT NULL DEFAULT 0,
    lock_until      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  );
`;

/** Crea la tabla "users" si no existe (solo se ejecuta una vez por proceso). */
export function ensureSchema() {
  if (!globalForDb.schemaReady) {
    globalForDb.schemaReady = pool.query(SCHEMA).then(() => undefined);
  }
  return globalForDb.schemaReady;
}
