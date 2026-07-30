"use client";

import { SessionProvider } from "next-auth/react";

type ProvidersProps = {
  children: React.ReactNode;
  authReady: boolean;
};

export function Providers({ children, authReady }: ProvidersProps) {
  // Avoid session polling and NO_SECRET warnings in demo mode.
  if (!authReady) return <>{children}</>;

  return <SessionProvider>{children}</SessionProvider>;
}
