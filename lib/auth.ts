import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function getAllowedDomains(): string[] {
  const multiDomainEnv = process.env.ALLOWED_EMAIL_DOMAINS;
  if (multiDomainEnv) {
    const parsed = multiDomainEnv
      .split(",")
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean);

    if (parsed.length > 0) return parsed;
  }

  const singleDomain = process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase();
  return singleDomain ? [singleDomain] : ["naturalabs.io"];
}

const allowedDomains = getAllowedDomains();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "unset",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "unset",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase() ?? "";
      const allowed = allowedDomains.some((domain) => email.endsWith(`@${domain}`));
      if (!allowed) {
        return false;
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.NEXTAUTH_SECRET,
  );
}
