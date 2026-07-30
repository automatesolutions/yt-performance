export type AlertLevel = "10K" | "20K" | "50K" | string;

export type CreativePerformance = {
  pulled_at: string;
  client_id: string;
  client_name: string;
  asset_id: string;
  ad_name: string;
  youtube_url: string;
  campaign_name: string;
  launch_date: string;
  active_days: number;
  spend_lifetime: number;
  spend_30d: number;
  conversions: number;
  conv_value: number;
  impressions: number;
  clicks: number;
  views: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpv: number;
  roas: number;
  conv_rate: number;
  q25: number;
  q50: number;
  q75: number;
  q100: number;
  /** Video length in seconds — used for play-through X-axis time labels. */
  duration_seconds: number;
  threshold: AlertLevel;
  alert_level: AlertLevel;
};

export type CampaignSpendRow = {
  campaign_name: string;
  spend_30d: number;
  conversions: number;
  views: number;
};

export type PivotClientRow = {
  client_name: string;
  creatives: number;
  spend_30d: number;
  conversions: number;
  conv_value: number;
  roas: number;
  views: number;
  children: Array<{
    asset_id: string;
    ad_name: string;
    spend_30d: number;
    conversions: number;
    roas: number;
  }>;
};

export type SortKey = "spend_30d" | "roas" | "conversions";
