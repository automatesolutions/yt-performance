import type { CreativePerformance, PivotClientRow, SortKey } from "@/lib/types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`;
}

export function formatRoas(value: number): string {
  return value.toFixed(2);
}

export function formatLaunchDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Format seconds as m:ss or h:mm:ss for chart axis labels. */
export function formatVideoTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function filterAndSortCreatives(
  rows: CreativePerformance[],
  opts: {
    client?: string;
    minSpend?: number;
    sort?: SortKey;
    q?: string;
  },
): CreativePerformance[] {
  const client = opts.client?.trim();
  const minSpend = opts.minSpend ?? 0;
  const sort = opts.sort ?? "spend_30d";
  const q = opts.q?.trim().toLowerCase();

  let result = rows.filter((r) => r.spend_30d >= minSpend);
  if (client && client !== "all") {
    result = result.filter((r) => r.client_name === client);
  }
  if (q) {
    result = result.filter(
      (r) =>
        r.ad_name.toLowerCase().includes(q) ||
        r.client_name.toLowerCase().includes(q),
    );
  }

  result = [...result].sort((a, b) => b[sort] - a[sort]);
  return result;
}

export function summarizeCreatives(rows: CreativePerformance[]) {
  const spend = rows.reduce((s, r) => s + r.spend_30d, 0);
  const conversions = rows.reduce((s, r) => s + r.conversions, 0);
  const convValue = rows.reduce((s, r) => s + r.conv_value, 0);
  const views = rows.reduce((s, r) => s + r.views, 0);
  return {
    spend,
    conversions,
    views,
    roas: spend > 0 ? convValue / spend : 0,
  };
}

export function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function uniqueClients(rows: CreativePerformance[]): string[] {
  return [...new Set(rows.map((r) => r.client_name))].sort();
}

/** Pivot ROAS = sum(conv_value) / sum(spend), not average of row ROASes. */
export function buildPivot(rows: CreativePerformance[]): PivotClientRow[] {
  const map = new Map<string, PivotClientRow>();

  for (const row of rows) {
    let group = map.get(row.client_name);
    if (!group) {
      group = {
        client_name: row.client_name,
        creatives: 0,
        spend_30d: 0,
        conversions: 0,
        conv_value: 0,
        roas: 0,
        views: 0,
        children: [],
      };
      map.set(row.client_name, group);
    }
    group.creatives += 1;
    group.spend_30d += row.spend_30d;
    group.conversions += row.conversions;
    group.conv_value += row.conv_value;
    group.views += row.views;
    group.children.push({
      asset_id: row.asset_id,
      ad_name: row.ad_name,
      spend_30d: row.spend_30d,
      conversions: row.conversions,
      roas: row.roas,
    });
  }

  return [...map.values()]
    .map((g) => ({
      ...g,
      roas: g.spend_30d > 0 ? g.conv_value / g.spend_30d : 0,
      children: [...g.children].sort((a, b) => b.spend_30d - a.spend_30d),
    }))
    .sort((a, b) => b.spend_30d - a.spend_30d);
}

export function costPerConv(spend: number, conversions: number): number {
  if (conversions <= 0) return 0;
  return spend / conversions;
}
