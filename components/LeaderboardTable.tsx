import Link from "next/link";
import { Sparkline, sparklineFromSeed } from "@/components/Sparkline";
import { TierPill } from "@/components/TierPill";
import {
  clientInitials,
  formatCurrency,
  formatNumber,
  formatRoas,
} from "@/lib/format";
import type { CreativePerformance } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type LeaderboardTableProps = {
  rows: CreativePerformance[];
};

function RankBadge({ rank }: { rank: number }) {
  const tone =
    rank === 1
      ? "bg-[var(--rank-1)] text-white"
      : rank === 2
        ? "bg-[var(--rank-2)] text-white"
        : rank === 3
          ? "bg-[var(--rank-3)] text-white"
          : "bg-[#e2e8f0] text-[var(--muted)]";

  return (
    <Badge
      className={`h-7 w-7 justify-center rounded-full text-xs font-bold num ${tone}`}
    >
      {rank}
    </Badge>
  );
}

export function LeaderboardTable({ rows }: LeaderboardTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--muted)]">
        No creatives match these filters.
      </p>
    );
  }

  return (
    <Table className="data-table table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead className="w-[34%]">Creative</TableHead>
          <TableHead className="num-col w-[12%]">Spend</TableHead>
          <TableHead className="num-col w-[8%]">Conv</TableHead>
          <TableHead className="num-col w-[8%]">ROAS</TableHead>
          <TableHead className="w-[11%]">Trend</TableHead>
          <TableHead className="w-[8%]">Tier</TableHead>
          <TableHead className="text-right w-[8%]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
          {rows.map((row, i) => {
            const rank = i + 1;
            const series = sparklineFromSeed(row.asset_id);
            const rising = series[series.length - 1] >= series[0];
            return (
              <TableRow key={row.asset_id}>
                <TableCell>
                  <RankBadge rank={rank} />
                </TableCell>
                <TableCell className="max-w-0">
                  <Link
                    href={`/performance/${encodeURIComponent(row.asset_id)}`}
                    className="group flex w-full min-w-0 items-center gap-3"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">
                      {clientInitials(row.client_name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                        {row.ad_name}
                      </span>
                      <span className="block truncate text-xs text-[var(--muted)]">
                        {row.client_name}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="num num-col font-medium">
                  {formatCurrency(row.spend_30d)}
                </TableCell>
                <TableCell className="num num-col">
                  {formatNumber(row.conversions)}
                </TableCell>
                <TableCell className="num-col">
                  <Badge
                    className={`roas-pill ${row.roas >= 1 ? "good" : "weak"}`}
                  >
                    {formatRoas(row.roas)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Sparkline values={series} positive={rising} />
                </TableCell>
                <TableCell>
                  <TierPill level={row.alert_level || row.threshold} />
                </TableCell>
                <TableCell className="text-right">
                  {row.youtube_url ? (
                    <Button
                      nativeButton={false}
                      render={
                        <a
                          href={row.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      variant="link"
                      className="h-auto p-0 text-sm font-semibold text-[var(--accent)]"
                    >
                      View ↗
                    </Button>
                  ) : (
                    <Button
                      nativeButton={false}
                      render={
                        <Link
                          href={`/performance/${encodeURIComponent(row.asset_id)}`}
                        />
                      }
                      variant="link"
                      className="h-auto p-0 text-sm font-semibold text-[var(--accent)]"
                    >
                      View ↗
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
