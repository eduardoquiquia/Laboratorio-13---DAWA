import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-200 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-l-8 border-violet-700">
          <h1 className="text-3xl text-violet-900 font-bold mb-2">
            Dashboard
          </h1>
          <p className="text-gray-700">
            Bienvenido,{' '}
            <span className="font-semibold text-orange-600">{session?.user?.name}</span>
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-violet-700 text-white rounded-2xl shadow-lg p-6">
            <p className="text-sm uppercase tracking-wide text-violet-200">Sesión iniciada con</p>
            <p className="text-2xl font-bold capitalize mt-1">{session?.user?.provider ?? '—'}</p>
          </div>
          <div className="bg-orange-500 text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between">
            <p className="text-sm uppercase tracking-wide text-orange-100">Tu cuenta</p>
            <Link
              href="/profile"
              className="mt-3 inline-block self-start bg-white text-orange-600 font-semibold py-2 px-4 rounded-lg hover:bg-orange-50 transition"
            >
              Ver perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
