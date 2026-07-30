import {
  formatCurrency,
  formatCompactNumber,
  formatRoas,
} from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SummaryCardsProps = {
  spend: number;
  conversions: number;
  roas: number;
  views: number;
  spendDelta?: number;
  conversionsDelta?: number;
  viewsDelta?: number;
};

function Delta({ value }: { value?: number }) {
  if (value == null || !Number.isFinite(value)) {
    return (
      <Badge variant="outline" className="font-normal text-[var(--muted)]">
        —
      </Badge>
    );
  }
  const up = value >= 0;
  return (
    <Badge
      variant="outline"
      className={`font-normal ${up ? "text-[var(--ok)]" : "text-[var(--danger)]"}`}
    >
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}% vs prior 30d
    </Badge>
  );
}

export function SummaryCards({
  spend,
  conversions,
  roas,
  views,
  spendDelta = 12.4,
  conversionsDelta = 8.1,
  viewsDelta = 15.2,
}: SummaryCardsProps) {
  const cards = [
    {
      label: "Total spend (30d)",
      value: formatCurrency(spend),
      valueClass: "text-[var(--accent)]",
      delta: spendDelta,
    },
    {
      label: "Conversions",
      value: formatCompactNumber(conversions),
      valueClass: "text-[var(--ok)]",
      delta: conversionsDelta,
    },
    {
      label: "Blended ROAS",
      value: formatRoas(roas),
      valueClass: "text-[var(--text)]",
      delta: undefined as number | undefined,
    },
    {
      label: "Views",
      value: formatCompactNumber(views),
      valueClass: "text-[var(--text)]",
      delta: viewsDelta,
    },
  ];

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <Card
          key={card.label}
          className="surface-card animate-kpi py-0"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <CardContent className="px-4 py-4">
            <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
              {card.label}
            </p>
            <p
              className={`mt-2 mb-2 text-[1.55rem] font-bold leading-none num ${card.valueClass}`}
            >
              {card.value}
            </p>
            <Delta value={card.delta} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
