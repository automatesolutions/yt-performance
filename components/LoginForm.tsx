"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm({ authReady }: { authReady: boolean }) {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 animate-fade-in">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-950 text-zinc-100">
        <CardHeader className="items-center text-center">
          <Image
            src="/brand/logo-n.png"
            alt="Natura Labs"
            width={72}
            height={72}
            className="mb-2 h-18 w-18"
            priority
          />
          <CardTitle className="text-2xl font-bold tracking-wide">
            Creative performance
          </CardTitle>
          <p className="max-w-sm text-sm text-zinc-400">
            Private dashboard for YouTube / Demand Gen creatives. Sign in with
            your company Google account.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
              {error === "AccessDenied"
                ? "Only @naturalabs.io or @clickbaitagency.com accounts can access this app."
                : "Sign-in failed. Try again or contact Lab ops."}
            </p>
          )}

          {!authReady ? (
            <p className="text-center text-sm text-amber-300">
              Auth is not configured. Set GOOGLE_CLIENT_ID,
              GOOGLE_CLIENT_SECRET, and NEXTAUTH_SECRET in .env.local. Demo
              data pages work when auth is bypassed in development.
            </p>
          ) : (
            <Button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/performance" })}
              className="h-11 w-full rounded-full bg-white text-black hover:bg-zinc-200"
            >
              Sign in with Google
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
