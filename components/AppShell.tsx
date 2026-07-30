"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellProps = {
  children: React.ReactNode;
  demo?: boolean;
};

function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "text-[var(--muted)] hover:bg-[var(--panel-2)] hover:text-[var(--text)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[var(--accent)]" : "bg-[#cbd5e1]"}`}
      />
      {label}
    </Link>
  );
}

export function AppShell({ children, demo = false }: AppShellProps) {
  const pathname = usePathname();
  const onLeaderboard =
    pathname === "/performance" ||
    (pathname.startsWith("/performance/") &&
      !pathname.startsWith("/performance/pivot"));
  const onPivot = pathname.startsWith("/performance/pivot");

  return (
    <div className="min-h-screen md:flex">
      <aside className="flex w-full flex-col border-b border-[var(--border)] bg-[var(--sidebar)] md:w-[240px] md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-5 py-5">
          <Image
            src="/brand/logo-n.png"
            alt="Natura Labs"
            width={32}
            height={32}
            className="h-8 w-8 rounded"
            priority
          />
          <div className="leading-tight">
            <div className="text-sm font-bold text-[var(--text)]">naturalabs</div>
            <div className="text-xs text-[var(--muted)]">/ performance</div>
          </div>
        </div>

        <nav className="flex-1 space-y-5 px-3 py-5">
          <div>
            <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              Dashboard
            </p>
            <div className="space-y-1">
              <NavItem
                href="/performance"
                label="Leaderboard"
                active={onLeaderboard}
              />
              <NavItem
                href="/performance/pivot"
                label="Pivot"
                active={onPivot}
              />
            </div>
          </div>
        </nav>

        <div className="border-t border-[var(--border)] px-4 py-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel-2)] px-3 py-1.5 text-xs text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ok)]" />
            Google OAuth
            {demo ? " · demo" : ""}
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-[1120px] animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
