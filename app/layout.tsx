import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { isAuthConfigured } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "yt.naturalabs.io /performance",
  description: "Private YouTube / Demand Gen creative performance dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authReady = isAuthConfigured();

  return (
    <html lang="en" className="font-sans">
      <body className="antialiased">
        <Providers authReady={authReady}>{children}</Providers>
      </body>
    </html>
  );
}
