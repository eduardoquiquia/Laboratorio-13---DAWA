import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-200 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-violet-800 to-orange-500" />

        <div className="px-6 sm:px-8 pb-8">
          <div className="-mt-12 mb-4">
            {user?.image ? (
              <Image
                height={100}
                width={100}
                src={user.image}
                alt="Profile"
                className="w-24 h-24 rounded-full ring-4 ring-white shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-md bg-violet-700 text-white text-3xl font-bold flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
            )}
          </div>

          <h1 className="text-3xl text-violet-900 font-bold mb-6">Profile</h1>

          <dl className="divide-y divide-gray-100">
            <div className="py-3 flex flex-wrap justify-between gap-2">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-semibold text-gray-900">{user?.name}</dd>
            </div>
            <div className="py-3 flex flex-wrap justify-between gap-2">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-semibold text-gray-900 break-all">{user?.email ?? '—'}</dd>
            </div>
            <div className="py-3 flex flex-wrap justify-between gap-2 items-center">
              <dt className="text-gray-500">Proveedor</dt>
              <dd>
                <span className="capitalize bg-orange-100 text-orange-700 font-semibold text-sm py-1 px-3 rounded-full">
                  {user?.provider ?? '—'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
