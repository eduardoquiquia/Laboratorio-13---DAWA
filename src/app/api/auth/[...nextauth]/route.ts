import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// authOptions vive en src/lib/auth.ts: en Next.js 16 un route handler
// solo puede exportar GET/POST/etc., exportar otra cosa rompe el build.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
