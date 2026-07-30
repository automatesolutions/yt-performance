"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import {
  clientInitials,
  costPerConv,
  formatCurrency,
  formatCurrencyPrecise,
  formatLaunchDate,
  formatNumber,
  formatPercent,
  formatRoas,
  formatVideoTime,
} from "@/lib/format";
import type { CampaignSpendRow, CreativePerformance } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CreativeDetailProps = {
  creative: CreativePerformance;
  campaigns: CampaignSpendRow[];
};

function buildPlayThroughSeries(creative: CreativePerformance) {
  const duration = creative.duration_seconds > 0 ? creative.duration_seconds : 0;
  const points = [
    { pct: 0, value: 100 },
    { pct: 0.25, value: creative.q25 },
    { pct: 0.5, value: creative.q50 },
    { pct: 0.75, value: creative.q75 },
    { pct: 1, value: creative.q100 },
  ];

  return points.map((p) => {
    const seconds = duration > 0 ? duration * p.pct : p.pct * 100;
    return {
      label:
        duration > 0
          ? formatVideoTime(seconds)
          : p.pct === 0
            ? "0%"
            : `${Math.round(p.pct * 100)}%`,
      seconds,
      value: p.value,
      quartileLabel:
        p.pct === 0 ? "Start" : `${Math.round(p.pct * 100)}% of video`,
    };
  });
}

export function CreativeDetail({ creative, campaigns }: CreativeDetailProps) {
  const chartData = buildPlayThroughSeries(creative);
  const durationLabel =
    creative.duration_seconds > 0
      ? formatVideoTime(creative.duration_seconds)
      : null;

  const roasClass =
    creative.roas >= 1 ? "text-[var(--ok)]" : "text-[var(--warn)]";

  const kpis = [
    { label: "Spend 30d", value: formatCurrency(creative.spend_30d) },
    { label: "Conversions", value: formatNumber(creative.conversions) },
    {
      label: "Cost / Conv",
      value: formatCurrencyPrecise(
        costPerConv(creative.spend_30d, creative.conversions),
      ),
    },
    {
      label: "ROAS",
      value: formatRoas(creative.roas),
      className: roasClass,
    },
    { label: "Views", value: formatNumber(creative.views) },
    { label: "CPV", value: formatCurrencyPrecise(creative.cpv) },
    { label: "CTR", value: formatPercent(creative.ctr) },
    { label: "CPC", value: formatCurrencyPrecise(creative.cpc) },
  ];

  return (
    <div>
      <Button
        variant="link"
        nativeButton={false}
        render={<Link href="/performance" />}
        className="h-auto p-0 text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)]"
      >
        ← Back to leaderboard
      </Button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">
            {clientInitials(creative.client_name)}
          </span>
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {creative.client_name}
            </p>
            <h1 className="mt-1 mb-0 text-[1.6rem] font-bold tracking-tight">
              {creative.ad_name}
            </h1>
            <p className="mt-2 mb-0 text-sm text-[var(--muted)]">
              Launch {formatLaunchDate(creative.launch_date)} ·{" "}
              {creative.active_days} active days · Lifetime{" "}
              {formatCurrency(creative.spend_lifetime)}
            </p>
          </div>
        </div>
        {creative.youtube_url ? (
          <Button
            nativeButton={false}
            render={
              <a
                href={creative.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="h-10 rounded-full bg-[var(--accent)] px-4 text-white hover:opacity-90"
          >
            View ad ↗
          </Button>
        ) : null}
      </div>

      <div className="my-5 grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
        {kpis.map((kpi, i) => (
          <Card
            key={kpi.label}
            className="surface-card animate-kpi py-0"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <CardContent className="px-4 py-3">
              <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-[var(--muted)]">
                {kpi.label}
              </div>
              <div
                className={`mt-1 text-[1.15rem] font-bold num ${kpi.className ?? ""}`}
              >
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="surface-card">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Video play-through (30d)
          </CardTitle>
          <p className="mt-2 mb-0 text-sm text-[var(--muted)]">
          {durationLabel ? (
            <>
              Length {durationLabel} · Still watching at{" "}
              {formatVideoTime(creative.duration_seconds * 0.25)}{" "}
              {formatPercent(creative.q25, 1)} ·{" "}
              {formatVideoTime(creative.duration_seconds * 0.5)}{" "}
              {formatPercent(creative.q50, 1)} ·{" "}
              {formatVideoTime(creative.duration_seconds * 0.75)}{" "}
              {formatPercent(creative.q75, 1)} ·{" "}
              {formatVideoTime(creative.duration_seconds)}{" "}
              {formatPercent(creative.q100, 1)}
            </>
          ) : (
            <>
              25% {formatPercent(creative.q25, 1)} · 50%{" "}
              {formatPercent(creative.q50, 1)} · 75%{" "}
              {formatPercent(creative.q75, 1)} · 100%{" "}
              {formatPercent(creative.q100, 1)}
            </>
          )}
          </p>
        </CardHeader>

        <CardContent>
          <div className="mt-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
            >
              <CartesianGrid stroke="#e6ebf2" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#94a3b8"
                tick={{ fill: "#64748b", fontSize: 12 }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e6ebf2",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#64748b" }}
                formatter={(value: number) => [
                  `${value.toFixed(1)}% still watching`,
                  "Retention",
                ]}
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as
                    | { label?: string; quartileLabel?: string }
                    | undefined;
                  if (!point) return "";
                  return durationLabel
                    ? `${point.label} · ${point.quartileLabel}`
                    : String(point.label ?? "");
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: "#2563eb", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {campaigns.length > 0 && (
        <Card className="surface-card mt-4 overflow-hidden py-0">
          <CardHeader className="border-b border-[var(--border)] px-5 py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Spend by campaign
            </CardTitle>
          </CardHeader>
          <CardContent className="px-1 pb-1">
            <Table className="data-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="num-col">Spend 30d</TableHead>
                  <TableHead className="num-col">Conv</TableHead>
                  <TableHead className="num-col">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.campaign_name}>
                    <TableCell>{c.campaign_name}</TableCell>
                    <TableCell className="num num-col">
                      {formatCurrency(c.spend_30d)}
                    </TableCell>
                    <TableCell className="num num-col">
                      {formatNumber(c.conversions)}
                    </TableCell>
                    <TableCell className="num num-col text-[var(--muted)]">
                      {formatNumber(c.views)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
