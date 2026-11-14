-- Tabla de usuarios para el login con credenciales.
-- (La app también la crea automáticamente la primera vez que se usa.)
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100)  NOT NULL,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  failed_attempts INTEGER       NOT NULL DEFAULT 0,
  lock_until      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
