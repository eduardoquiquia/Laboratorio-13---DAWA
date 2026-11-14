import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import LogoutButton from "../components/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Provider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Auth App",
  description: "My Next Auth App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-200 min-h-screen`}
      >
        <nav className="w-full bg-gradient-to-r from-violet-900 to-purple-700 text-white shadow-md border-b-4 border-orange-500">
          <div className="mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight">
              My<span className="text-orange-400">Auth</span>App
            </Link>
            <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm font-medium">
              <li>
                <Link href="/dashboard" className="hover:text-orange-300 transition">
                  Dashboard
                </Link>
              </li>
              {session?.user && (
                <li>
                  <Link href="/profile" className="hover:text-orange-300 transition">
                    Profile
                  </Link>
                </li>
              )}
              {session?.user && (
                <li>
                  <LogoutButton />
                </li>
              )}
              {!session?.user && (
                <li>
                  <Link
                    href="/signIn"
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition"
                  >
                    Sign In
                  </Link>
                </li>
              )}
              {session?.user?.image && (
                <li>
                  <Image
                    height={100}
                    width={100}
                    src={session?.user?.image}
                    alt="Profile"
                    className="w-10 h-10 rounded-full ring-2 ring-orange-400"
                  />
                </li>
              )}
            </ul>
          </div>
        </nav>
        <Provider>
          <main>{children}</main>
        </Provider>
      </body>
    </html>
  );
}
