# yt.naturalabs.io /performance

Private internal dashboard for YouTube / Demand Gen creative performance.

- **Slack** stays for spend-tier alerts (10K / 20K / 50K).
- **This site** is for browsing Leaderboard, Pivot, and Creative detail.
- Login: Google OAuth — **`@naturalabs.io` only**.

UI spec / mockup: [`performance-mockup.html`](performance-mockup.html) (also at `/performance-mockup.html` when the app is running).

---

## Stack

| Layer | Choice |
|-------|--------|
| App | Next.js (App Router) + TypeScript + Tailwind |
| Auth | Auth.js (NextAuth) Google provider |
| Charts | Recharts (play-through on Detail) |
| Data (MVP) | Google Sheets tab `performance_leaderboard` |
| Host (recommended) | **GCP Cloud Run** |

---

## Architecture (n8n ↔ website)

**n8n does not call the web app.** No Sheet webhook. Shared store only:

```
Google Ads API
      ↓
n8n (existing creative spend alerts)
      ↓
Format Merge 30-Day Metrics + Quartile
      ↓
NEW: Upsert Performance Store  →  Google Sheet tab performance_leaderboard
      ↓
(rest unchanged) Chart → Slack → Write Alert Log
      ↓
Next.js on Cloud Run reads Sheet (service account)
      ↓
yt.naturalabs.io/performance  (OAuth → Leaderboard / Pivot / Detail)
```

| System | Role |
|--------|------|
| **n8n** | Writes / upserts rows (`client_id` + `asset_id`) |
| **Google Sheet** | Private performance store |
| **Web app** | Reads Sheet server-side; serves UI |

---

## Quick start (local)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000/performance](http://localhost:3000/performance).

With auth + Sheets env **empty**, the app serves **fixture/demo data** from `data/fixture.ts`.

---

## Pages

| Route | Purpose |
|-------|---------|
| `/login` | `[N]` branded Google sign-in |
| `/performance` | Leaderboard |
| `/performance/pivot` | Client rollups + drill-down |
| `/performance/[assetId]` | Creative detail + play-through (X-axis = video time) |
| `/performance-mockup.html` | UI spec (static) |

---

## Connect n8n

1. Keep the existing Slack alert workflow.
2. After **Format Merge 30-Day Metrics + Quartile**, add **Google Sheets → Append or Update** (upsert).
3. Upsert key: **`client_id` + `asset_id`**.
4. Write one row per creative into tab **`performance_leaderboard`**.
5. Prefer writing from Format Merge (all creatives with metrics), not only after Slack.

### Sheet columns (header row required)

| Column | Source |
|--------|--------|
| `pulled_at` | `{{ $now }}` |
| `client_id` | Format Merge / Switch |
| `client_name` | Format Merge |
| `asset_id` | Format Merge |
| `ad_name` | Format Merge |
| `youtube_url` | Format Merge |
| `campaign_name` | Format Merge |
| `launch_date` | Format Launch Date (may be blank earlier) |
| `active_days` | Format Launch Date |
| `spend_lifetime` | Dedupe / alert spend |
| `spend_30d` | Format Merge |
| `conversions` | Format Merge |
| `conv_value` | Format Merge |
| `impressions` | Format Merge |
| `clicks` | Format Merge |
| `views` | Format Merge |
| `ctr` | Format Merge |
| `cpc` | Format Merge |
| `cpm` | Format Merge |
| `cpv` | Format Merge |
| `roas` | Format Merge |
| `conv_rate` | Format Merge |
| `q25` | Format Merge |
| `q50` | Format Merge |
| `q75` | Format Merge |
| `q100` | Format Merge |
| `duration_seconds` | Video length in **seconds** (play-through time axis) |
| `threshold` | `10K` / `20K` / `50K` |
| `alert_level` | same as threshold |

Pivot ROAS in the app = **sum(conv_value) ÷ sum(spend_30d)** (not average of row ROASes).

Share the Sheet **privately** with the app service account (Viewer) and give n8n write access.

---

## Credentials — how to get each env var

Copy [`.env.example`](.env.example) → `.env.local` (local) or Cloud Run / Secret Manager (prod).

### Already in n8n (keep)

- Google Ads OAuth2  
- Ads developer-token  
- MCC `login-customer-id`  
- Slack  
- Google Sheets (alert log + performance upsert)  

### New — web app

#### `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

1. [Google Cloud Console](https://console.cloud.google.com/) → project  
2. **APIs & Services → OAuth consent screen** (configure; Internal if Workspace)  
3. **Credentials → Create credentials → OAuth client ID**  
4. Type: **Web application**  
5. Authorized JavaScript origins:
   - `https://yt.naturalabs.io`
   - `http://localhost:3000`
6. Authorized redirect URIs:
   - `https://yt.naturalabs.io/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID + Client secret  

#### `NEXTAUTH_SECRET`

Generate a random string:

```bash
openssl rand -base64 32
```

#### `NEXTAUTH_URL`

- Production: `https://yt.naturalabs.io`  
- Local: `http://localhost:3000`  

#### `ALLOWED_EMAIL_DOMAIN`

```
naturalabs.io
```

Only emails ending in `@naturalabs.io` can sign in.

#### `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

1. GCP → **IAM & Admin → Service Accounts → Create** (e.g. `yt-performance-reader`)  
2. **Keys → Add key → JSON**  
3. From the JSON:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (keep `\n` escapes in quotes)  
4. Enable **Google Sheets API** on the project  

#### `GOOGLE_SHEETS_SPREADSHEET_ID`

From the Sheet URL:

```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

#### `GOOGLE_SHEETS_TAB`

```
performance_leaderboard
```

Must match the tab name exactly.

### Env template

```
# Auth (user login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://yt.naturalabs.io
ALLOWED_EMAIL_DOMAIN=naturalabs.io

# Data (server-only — service account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_TAB=performance_leaderboard
```

**Never** put service account keys, OAuth secrets, or Ads developer tokens in frontend JS.

### Who owns what

| System | Credentials |
|--------|-------------|
| **n8n** | Ads OAuth, developer-token, MCC id, Slack, Sheets write |
| **Web app** | OAuth web client, NextAuth secret, service account (Sheet read) |
| **DNS / Access** | `yt.naturalabs.io` + TLS; optional Cloudflare Access / IAP |

---

## Deploy on GCP (Cloud Run)

Recommended path:

```
Docker / Cloud Build
      ↓
Artifact Registry
      ↓
Cloud Run
      ↓
Custom domain yt.naturalabs.io
```

### Checklist

1. Sheet + n8n upsert working (rows appear)  
2. Service account can read Sheet; OAuth web client ready  
3. Enable **Cloud Run**, **Artifact Registry**, **Secret Manager**  
4. Build Next.js container → push image  
5. Deploy Cloud Run; set env vars (secrets in Secret Manager)  
6. Map domain `yt.naturalabs.io`  
7. Confirm OAuth origins/redirects match production  
8. Sign in with `@naturalabs.io` — live data (not Demo)  

### Cloud Run tips

| Setting | Suggestion |
|---------|------------|
| Ingress | Allow unauthenticated (app does Google login) |
| CPU / memory | 1 vCPU, 512MB–1GB |
| Secrets | Client secret, NextAuth secret, SA private key |
| Port | Next.js listen port (usually `3000`) |

n8n location does **not** change when you deploy the website.

---

## Brand / UI

- Logo: `public/brand/logo-n.png` (from `asset/Logo-1.png`)  
- App UI: light dashboard shell (sidebar + KPI cards + leaderboard)  
- Login: dark `[N]` branded screen  

---

## Practical order

1. Create Sheet + headers  
2. Add n8n **Upsert Performance Store** → confirm rows  
3. Create service account + share Sheet  
4. Create OAuth web client  
5. Deploy to Cloud Run + set env  
6. Point DNS + test `@naturalabs.io` login + live Leaderboard  
