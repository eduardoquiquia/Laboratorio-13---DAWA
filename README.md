# Lab 13 – NextAuth.js: Google, GitHub y Credenciales

Proyecto del laboratorio 13 (Autenticación y Seguridad) + la **tarea**:

| Parte | Qué incluye |
|---|---|
| **Laboratorio** (commit 1) | Login con Google OAuth, páginas `/signIn`, `/dashboard`, `/profile`, botón de cerrar sesión, protección de rutas |
| **Tarea** (commit 2) | `CredentialsProvider` con **registro**, **bloqueo tras 3 intentos fallidos**, contraseñas cifradas con **bcrypt**, y `GitHubProvider` |

Stack: Next.js 16 (App Router, TypeScript, Tailwind) · next-auth v4 · PostgreSQL (`pg`) · bcrypt

---

## 1. Instalar

```bash
npm install
cp .env.example .env.local     # en Windows: copy .env.example .env.local
```

## 2. Variables de entorno (`.env.local`)

### Google (laboratorio)
1. https://console.developers.google.com/apis/credentials → crear proyecto → **Crear credenciales → ID de cliente OAuth** (Aplicación web).
2. **Orígenes JavaScript autorizados:** `http://localhost:3000`
3. **URI de redireccionamiento autorizados:** `http://localhost:3000/api/auth/callback/google`
4. Copia el ID y el Secret a `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

### GitHub (tarea)
1. https://github.com/settings/developers → **OAuth Apps → New OAuth App**
2. **Homepage URL:** `http://localhost:3000`
3. **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Copia el *Client ID* a `GITHUB_ID` y genera un *Client secret* → `GITHUB_SECRET`.

### Base de datos (tarea – usuarios con contraseña)
Se necesita PostgreSQL para guardar los usuarios registrados (en Vercel no se pueden guardar archivos).
La opción gratis más simple es **Neon**:
1. https://neon.tech → crear proyecto → copiar la *connection string*.
2. Pegarla en `DATABASE_URL` (termina en `?sslmode=require`).

La tabla `users` **se crea sola** la primera vez que alguien se registra (también está en `db/schema.sql` por si quieres crearla a mano).

### NextAuth
- `NEXTAUTH_SECRET`: genera uno en https://generate-secret.vercel.app/32
- `NEXTAUTH_URL=http://localhost:3000`

## 3. Ejecutar

```bash
npm run dev
```
Abre http://localhost:3000

---

## 4. Cómo funciona la tarea

### Registro (`/register` → `POST /api/register`)
- Valida nombre, correo y contraseña (mín. 8 caracteres) en el cliente **y** en el servidor.
- Si el correo ya existe responde `409`.
- La contraseña se guarda con `bcrypt.hash(password, 10)` → en la BD solo queda el hash (`$2b$10$...`), nunca la contraseña.
- Tras registrarse inicia sesión automáticamente.

### Login con credenciales (`src/lib/users.ts → verifyCredentials`)
1. Si la cuenta tiene `lock_until` en el futuro → **"Cuenta bloqueada… intenta en X minutos"**.
2. Compara con `bcrypt.compare(password, password_hash)`.
3. Si falla: suma `failed_attempts` y muestra los intentos que quedan. Al llegar a **3** se bloquea **5 minutos** (`MAX_LOGIN_ATTEMPTS` y `LOCK_MINUTES` en `.env.local`).
4. Si acierta: reinicia el contador.
5. Si el correo no existe se muestra el mismo mensaje genérico (no se revela qué correos están registrados).

### GitHub
`GitHubProvider` en `src/lib/auth.ts`. La página de perfil muestra con qué **proveedor** inició sesión el usuario (google / github / credentials).

---

## 5. Cambios respecto al documento del laboratorio (Next.js 16)

| Documento | Este proyecto | Motivo |
|---|---|---|
| `authOptions` exportado desde `app/api/auth/[...nextauth]/route.ts` | Movido a `src/lib/auth.ts` | Next 15+ no permite exportar nada que no sea GET/POST/etc. desde un `route.ts` (falla `npm run build` y el deploy en Vercel) |
| `src/middleware.ts` | `src/proxy.ts` | En Next 16 *middleware* se renombró a *proxy* (misma función) |
| `images.domains` | `images.remotePatterns` | `domains` está deprecado; además se agregó `avatars.githubusercontent.com` |
| `nav` sin color de texto | `text-white` | En modo claro el texto del menú quedaba negro sobre negro |

---

## 6. Desplegar en Vercel

1. Sube el proyecto a GitHub (`.env.local` **no** se sube, está en `.gitignore`).
2. https://vercel.com/new → importar el repositorio.
3. En **Settings → Environment Variables** agrega todas las variables de `.env.local`, con
   `NEXTAUTH_URL=https://TU-APP.vercel.app`.
4. Agrega las URLs de producción en los proveedores:
   - **Google:** origen `https://TU-APP.vercel.app` y redirect `https://TU-APP.vercel.app/api/auth/callback/google`
   - **GitHub:** una OAuth App solo acepta *un* callback, así que crea **otra OAuth App** para producción con callback `https://TU-APP.vercel.app/api/auth/callback/github` y usa *sus* `GITHUB_ID`/`GITHUB_SECRET` en Vercel.
5. Redeploy.

> Alternativa a Neon: en Vercel → **Storage → Create Database → Neon**; Vercel crea `DATABASE_URL` automáticamente.

---

## 7. Capturas sugeridas para el informe
1. `/register` con el formulario lleno
2. Login con credenciales correcto → `/dashboard`
3. Error "te quedan N intentos"
4. Mensaje de **cuenta bloqueada**
5. Tabla `users` en Neon (SQL Editor: `SELECT id, email, password_hash, failed_attempts, lock_until FROM users;`) mostrando el hash bcrypt
6. Login con GitHub → `/profile` mostrando *Proveedor: github* y el avatar
7. Login con Google → `/profile`
8. Acceso a `/dashboard` sin sesión → redirige a `/signIn`
