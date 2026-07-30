import { Badge } from "@/components/ui/badge";

type TierPillProps = {
  level: string;
};

export function TierPill({ level }: TierPillProps) {
  const normalized = level.toUpperCase();
  const isOk = normalized === "10K";
  return (
    <Badge
      variant="secondary"
      className={
        isOk
          ? "bg-[var(--ok-bg)] text-[var(--ok)] hover:bg-[var(--ok-bg)]"
          : "bg-[var(--warn-bg)] text-[var(--warn)] hover:bg-[var(--warn-bg)]"
      }
    >
      {normalized || "—"}
    </Badge>
  );
}
