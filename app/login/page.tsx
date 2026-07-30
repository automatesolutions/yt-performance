import { Suspense } from "react";
import { isAuthConfigured } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  const authReady = isAuthConfigured();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-[var(--muted)]">
          Loading…
        </div>
      }
    >
      <LoginForm authReady={authReady} />
    </Suspense>
  );
}
