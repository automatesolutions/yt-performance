import { Suspense } from "react";
import { FiltersToolbar } from "@/components/FiltersToolbar";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { SummaryCards } from "@/components/SummaryCards";
import {
  filterAndSortCreatives,
  summarizeCreatives,
  uniqueClients,
} from "@/lib/format";
import { getAllCreatives } from "@/lib/sheets";
import type { SortKey } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  client?: string;
  sort?: string;
  minSpend?: string;
  q?: string;
}>;

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const client = params.client ?? "all";
  const sort = (params.sort as SortKey) || "spend_30d";
  const minSpend = Number(params.minSpend ?? "0");
  const q = params.q ?? "";

  const { rows, source } = await getAllCreatives();
  const clients = uniqueClients(rows);
  const filtered = filterAndSortCreatives(rows, {
    client,
    sort,
    minSpend: Number.isFinite(minSpend) ? minSpend : 0,
    q,
  });
  const summary = summarizeCreatives(filtered);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-[1.75rem] font-bold tracking-tight text-[var(--text)]">
            Leaderboard
          </h1>
          <p className="mt-1 mb-0 text-sm text-[var(--muted)]">
            Ranked view of every creative. What’s performing best right now.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-1.5 text-xs text-[var(--muted)]">
          {source === "fixture" ? "Demo data" : "Live Sheet"} · last synced 2h
          ago
        </Badge>
      </div>

      <SummaryCards
        spend={summary.spend}
        conversions={summary.conversions}
        roas={summary.roas}
        views={summary.views}
      />

      <Card className="surface-card overflow-hidden py-0">
        <CardContent className="border-b border-[var(--border)] px-4 py-3 sm:px-5">
          <Suspense fallback={null}>
            <FiltersToolbar clients={clients} />
          </Suspense>
        </CardContent>
        <CardContent className="px-1 sm:px-2">
          <LeaderboardTable rows={filtered} />
        </CardContent>
      </Card>
    </>
  );
}
