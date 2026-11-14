import bcrypt from "bcrypt";
import { pool, ensureSchema } from "./db";

/** Nº de intentos fallidos permitidos antes de bloquear la cuenta. */
export const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS ?? 3);
/** Minutos que la cuenta permanece bloqueada. */
export const LOCK_MINUTES = Number(process.env.LOCK_MINUTES ?? 5);
/** Costo (salt rounds) de bcrypt. */
const SALT_ROUNDS = 10;

export type DbUser = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  failed_attempts: number;
  lock_until: Date | null;
};

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  await ensureSchema();
  const { rows } = await pool.query<DbUser>(
    "SELECT * FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  return rows[0] ?? null;
}

export async function createUser(name: string, email: string, password: string) {
  await ensureSchema();
  // bcrypt genera un salt aleatorio y lo guarda dentro del propio hash
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await pool.query<Pick<DbUser, "id" | "name" | "email">>(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    [name.trim(), email.toLowerCase(), passwordHash]
  );
  return rows[0];
}

/** Error con mensaje que se muestra tal cual en el formulario de login. */
export class LoginError extends Error {}

/**
 * Verifica email + contraseña aplicando el bloqueo por intentos fallidos.
 * Devuelve el usuario si es correcto; lanza LoginError en caso contrario.
 */
export async function verifyCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);

  // Mismo mensaje si el usuario no existe (no revelamos qué correos están registrados)
  if (!user) throw new LoginError("Correo o contraseña incorrectos.");

  // 1) ¿La cuenta está bloqueada?
  if (user.lock_until && new Date(user.lock_until) > new Date()) {
    const mins = Math.ceil((new Date(user.lock_until).getTime() - Date.now()) / 60000);
    throw new LoginError(
      `Cuenta bloqueada por demasiados intentos fallidos. Intenta de nuevo en ${mins} minuto(s).`
    );
  }

  // 2) Comparar la contraseña con el hash guardado
  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) {
    const attempts = user.failed_attempts + 1;

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      // Se alcanzó el límite: bloquear y reiniciar el contador
      await pool.query(
        `UPDATE users
           SET failed_attempts = 0,
               lock_until = NOW() + ($2 || ' minutes')::interval
         WHERE id = $1`,
        [user.id, LOCK_MINUTES]
      );
      throw new LoginError(
        `Has superado los ${MAX_LOGIN_ATTEMPTS} intentos. Tu cuenta quedó bloqueada por ${LOCK_MINUTES} minutos.`
      );
    }

    await pool.query(
      "UPDATE users SET failed_attempts = $2, lock_until = NULL WHERE id = $1",
      [user.id, attempts]
    );
    const left = MAX_LOGIN_ATTEMPTS - attempts;
    throw new LoginError(
      `Correo o contraseña incorrectos. Te queda${left === 1 ? "" : "n"} ${left} intento${left === 1 ? "" : "s"}.`
    );
  }

  // 3) Login correcto: reiniciar contador y desbloquear
  if (user.failed_attempts > 0 || user.lock_until) {
    await pool.query(
      "UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE id = $1",
      [user.id]
    );
  }

  return { id: String(user.id), name: user.name, email: user.email };
}
