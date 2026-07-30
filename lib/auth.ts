import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

function getEnv(name: string): string | undefined {
  return process.env[name]?.trim();
}

function getAllowedDomains(): string[] {
  const multiDomainEnv = getEnv("ALLOWED_EMAIL_DOMAINS");
  if (multiDomainEnv) {
    const parsed = multiDomainEnv
      .split(",")
      .map((domain) => domain.trim().toLowerCase())
      .filter(Boolean);

    if (parsed.length > 0) return parsed;
  }

  const singleDomain = getEnv("ALLOWED_EMAIL_DOMAIN")?.toLowerCase();
  return singleDomain ? [singleDomain] : ["naturalabs.io"];
}

const allowedDomains = getAllowedDomains();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: getEnv("GOOGLE_CLIENT_ID") || "unset",
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET") || "unset",
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
  secret: getEnv("NEXTAUTH_SECRET"),
};

export function isAuthConfigured(): boolean {
  return Boolean(
    getEnv("GOOGLE_CLIENT_ID") &&
      getEnv("GOOGLE_CLIENT_SECRET") &&
      getEnv("NEXTAUTH_SECRET"),
  );
}
