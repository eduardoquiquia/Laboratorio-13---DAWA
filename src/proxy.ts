// En Next.js 16 "middleware.ts" se renombró a "proxy.ts" (misma función).
// Equivale a: export { default } from "next-auth/middleware";
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/signIn" },
});

export const config = { matcher: ["/dashboard", "/profile"] };
