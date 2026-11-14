import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCredentials, LoginError } from "@/lib/users";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    // TAREA (2): autenticación con GitHub
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),

    // TAREA (1): inicio de sesión con credenciales (email + contraseña)
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Ingresa tu correo y contraseña.");
        }
        try {
          return await verifyCredentials(credentials.email, credentials.password);
        } catch (err) {
          // El mensaje llega al formulario en result.error
          if (err instanceof LoginError) throw new Error(err.message);
          console.error(err);
          throw new Error("Error del servidor. Intenta nuevamente.");
        }
      },
    }),
  ],

  // CredentialsProvider requiere sesiones con JWT
  session: { strategy: "jwt" },

  pages: {
    signIn: "/signIn",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id;
      if (account) token.provider = account.provider; // google | github | credentials
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string | undefined;
        session.user.provider = token.provider as string | undefined;
      }
      return session;
    },
  },
};
