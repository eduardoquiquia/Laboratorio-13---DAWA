'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/signIn' })}
      className="bg-orange-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-orange-600 transition"
    >
      Cerrar Sesión
    </button>
  );
}
