import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function getEnv(name: string): string | undefined {
  return process.env[name]?.trim();
}

function authConfigured(): boolean {
  return Boolean(
    getEnv("GOOGLE_CLIENT_ID") &&
      getEnv("GOOGLE_CLIENT_SECRET") &&
      getEnv("NEXTAUTH_SECRET"),
  );
}

export async function middleware(req: NextRequest) {
  // Local demo mode: browse fixture data without OAuth env vars.
  if (!authConfigured()) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: getEnv("NEXTAUTH_SECRET"),
  });

  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/performance/:path*"],
};
