'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login con credenciales (email + contraseña)
  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Mensaje enviado desde authorize(): intentos restantes, cuenta bloqueada, etc.
      setError(result.error === 'CredentialsSignin' ? 'Credenciales inválidas.' : result.error);
      return;
    }

    if (result?.ok) {
      // Navegación completa: así el layout (servidor) lee la nueva sesión
      // y no se reutiliza un prefetch de /dashboard hecho antes del login.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/dashboard';
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleGitHubSignIn = async () => {
    await signIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-200 px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm border-t-4 border-violet-700">
        <h1 className="text-2xl text-violet-900 font-bold mb-6 text-center">
          Sign In
        </h1>

        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="tucorreo@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-violet-800 transition disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-violet-100" />
          <span className="text-xs text-gray-500 uppercase">o continúa con</span>
          <div className="h-px flex-1 bg-violet-100" />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-orange-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
          >
            <FaGoogle />
            Continue with Google
          </button>

          <button
            onClick={handleGitHubSignIn}
            className="w-full bg-purple-950 text-white font-medium py-2 px-4 rounded-lg hover:bg-violet-900 transition flex items-center justify-center gap-2"
          >
            <FaGithub />
            Continue with GitHub
          </button>
        </div>

        <p className="text-sm text-gray-600 text-center mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="font-semibold text-orange-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
