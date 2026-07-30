import { google } from "googleapis";
import { FIXTURE_CREATIVES } from "@/data/fixture";
import type { CreativePerformance } from "@/lib/types";

const HEADER_MAP: Record<string, keyof CreativePerformance> = {
  pulled_at: "pulled_at",
  client_id: "client_id",
  client_name: "client_name",
  asset_id: "asset_id",
  ad_name: "ad_name",
  youtube_url: "youtube_url",
  campaign_name: "campaign_name",
  launch_date: "launch_date",
  active_days: "active_days",
  spend_lifetime: "spend_lifetime",
  spend_30d: "spend_30d",
  conversions: "conversions",
  conv_value: "conv_value",
  impressions: "impressions",
  clicks: "clicks",
  views: "views",
  ctr: "ctr",
  cpc: "cpc",
  cpm: "cpm",
  cpv: "cpv",
  roas: "roas",
  conv_rate: "conv_rate",
  q25: "q25",
  q50: "q50",
  q75: "q75",
  q100: "q100",
  duration_seconds: "duration_seconds",
  video_duration_seconds: "duration_seconds",
  duration: "duration_seconds",
  threshold: "threshold",
  alert_level: "alert_level",
};

const NUMERIC_FIELDS = new Set<keyof CreativePerformance>([
  "active_days",
  "spend_lifetime",
  "spend_30d",
  "conversions",
  "conv_value",
  "impressions",
  "clicks",
  "views",
  "ctr",
  "cpc",
  "cpm",
  "cpv",
  "roas",
  "conv_rate",
  "q25",
  "q50",
  "q75",
  "q100",
  "duration_seconds",
]);

function getEnv(name: string): string | undefined {
  return process.env[name]?.trim();
}

/** Normalize PEM private keys pasted into Cloud Run / .env (quotes, escaped newlines). */
function normalizePrivateKey(raw: string): string {
  let key = raw.trim();

  // Common Cloud Run paste from JSON: \"-----BEGIN...-----\\n\"
  key = key.replace(/^\\"/, '"').replace(/\\"$/, '"');

  // Strip wrapping quotes (repeat for double-wrapped values).
  for (let i = 0; i < 2; i++) {
    if (
      (key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))
    ) {
      key = key.slice(1, -1).trim();
    }
  }

  // Convert escaped newlines from env/JSON strings into real PEM line breaks.
  key = key
    .replace(/\\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  return key.trim();
}

function sheetsConfigured(): boolean {
  return Boolean(
    getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL") &&
      getEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY") &&
      getEnv("GOOGLE_SHEETS_SPREADSHEET_ID"),
  );
}

function parseNumber(value: string | undefined): number {
  if (value == null || value === "") return 0;
  const cleaned = String(value).replace(/[$,%\s,]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function rowFromValues(
  headers: string[],
  values: string[],
): CreativePerformance | null {
  const raw: Partial<CreativePerformance> = {};

  headers.forEach((header, i) => {
    const key = HEADER_MAP[header.trim().toLowerCase()];
    if (!key) return;
    const cell = values[i] ?? "";
    if (NUMERIC_FIELDS.has(key)) {
      (raw as Record<string, number | string>)[key] = parseNumber(cell);
    } else {
      (raw as Record<string, number | string>)[key] = String(cell);
    }
  });

  if (!raw.asset_id || !raw.ad_name) return null;

  return {
    pulled_at: String(raw.pulled_at ?? ""),
    client_id: String(raw.client_id ?? ""),
    client_name: String(raw.client_name ?? ""),
    asset_id: String(raw.asset_id),
    ad_name: String(raw.ad_name),
    youtube_url: String(raw.youtube_url ?? ""),
    campaign_name: String(raw.campaign_name ?? ""),
    launch_date: String(raw.launch_date ?? ""),
    active_days: Number(raw.active_days ?? 0),
    spend_lifetime: Number(raw.spend_lifetime ?? 0),
    spend_30d: Number(raw.spend_30d ?? 0),
    conversions: Number(raw.conversions ?? 0),
    conv_value: Number(raw.conv_value ?? 0),
    impressions: Number(raw.impressions ?? 0),
    clicks: Number(raw.clicks ?? 0),
    views: Number(raw.views ?? 0),
    ctr: Number(raw.ctr ?? 0),
    cpc: Number(raw.cpc ?? 0),
    cpm: Number(raw.cpm ?? 0),
    cpv: Number(raw.cpv ?? 0),
    roas: Number(raw.roas ?? 0),
    conv_rate: Number(raw.conv_rate ?? 0),
    q25: Number(raw.q25 ?? 0),
    q50: Number(raw.q50 ?? 0),
    q75: Number(raw.q75 ?? 0),
    q100: Number(raw.q100 ?? 0),
    duration_seconds: Number(raw.duration_seconds ?? 0),
    threshold: String(raw.threshold ?? raw.alert_level ?? ""),
    alert_level: String(raw.alert_level ?? raw.threshold ?? ""),
  };
}

async function fetchFromSheets(): Promise<CreativePerformance[]> {
  const email = getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL")!;
  const key = normalizePrivateKey(getEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")!);
  const spreadsheetId = getEnv("GOOGLE_SHEETS_SPREADSHEET_ID")!;
  const tab = getEnv("GOOGLE_SHEETS_TAB") || "performance_leaderboard";

  if (!key.includes("BEGIN") || !key.includes("PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not a valid PEM private key (missing BEGIN PRIVATE KEY).",
    );
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    // Keep the read range wide enough for schema growth (duration_seconds is at AA).
    range: `${tab}!A:ZZ`,
  });

  const values = res.data.values ?? [];
  if (values.length < 2) return [];

  const headers = values[0].map((h) => String(h));
  const rows: CreativePerformance[] = [];

  for (let i = 1; i < values.length; i++) {
    const parsed = rowFromValues(
      headers,
      values[i].map((v) => String(v ?? "")),
    );
    if (parsed) rows.push(parsed);
  }

  return rows;
}

export async function getAllCreatives(): Promise<{
  rows: CreativePerformance[];
  source: "sheets" | "fixture";
}> {
  if (!sheetsConfigured()) {
    return { rows: FIXTURE_CREATIVES, source: "fixture" };
  }

  try {
    const rows = await fetchFromSheets();
    if (rows.length === 0) {
      return { rows: FIXTURE_CREATIVES, source: "fixture" };
    }
    return { rows, source: "sheets" };
  } catch (err) {
    console.error("[sheets] Failed to load performance data:", err);
    return { rows: FIXTURE_CREATIVES, source: "fixture" };
  }
}

export async function getCreativeByAssetId(
  assetId: string,
): Promise<CreativePerformance | null> {
  const { rows } = await getAllCreatives();
  return rows.find((r) => r.asset_id === assetId) ?? null;
}
