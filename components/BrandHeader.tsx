import Image from "next/image";
import Link from "next/link";

type BrandHeaderProps = {
  active?: "leaderboard" | "pivot";
  showNav?: boolean;
  showLock?: boolean;
  demo?: boolean;
};

export function BrandHeader({
  active = "leaderboard",
  showNav = true,
  showLock = true,
  demo = false,
}: BrandHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
      <div className="flex items-center gap-4">
        <Image
          src="/brand/logo-n.png"
          alt="Natura Labs"
          width={56}
          height={56}
          className="h-14 w-14 shrink-0"
          priority
        />
        <div>
          <div className="text-[1.2rem] font-bold tracking-[0.02em] leading-tight">
            yt.naturalabs.io
            <span className="font-medium text-[var(--accent)]"> /performance</span>
          </div>
          {showNav && (
            <nav className="mt-2 flex gap-5 text-sm">
              <Link
                href="/performance"
                className={
                  active === "leaderboard"
                    ? "border-b border-[var(--accent)] pb-0.5 font-semibold text-[var(--text)]"
                    : "pb-0.5 text-[var(--muted)] hover:text-[var(--text)]"
                }
              >
                Leaderboard
              </Link>
              <Link
                href="/performance/pivot"
                className={
                  active === "pivot"
                    ? "border-b border-[var(--accent)] pb-0.5 font-semibold text-[var(--text)]"
                    : "pb-0.5 text-[var(--muted)] hover:text-[var(--text)]"
                }
              >
                Pivot
              </Link>
            </nav>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {demo && (
          <span className="text-[0.7rem] uppercase tracking-wider text-[var(--muted)]">
            Demo data
          </span>
        )}
        {showLock && (
          <div className="text-[0.7rem] text-[var(--muted)]">
            @naturalabs.io
          </div>
        )}
      </div>
    </header>
  );
}
