# Google Search Console Performance Dashboard — Setup Guide

## Overview

This document explains how to set up and use the Google Search Console integration for the Gül-Tekin Mühendislik website. The integration:

- Authenticates via OAuth2 with the Google Search Console API
- Creates database tables for storing performance data
- Syncs daily performance metrics (clicks, impressions, CTR, position)
- Displays data in an admin dashboard with trend charts, date range controls, and device breakdown

## Prerequisites

- A Google Cloud Console project with the **Search Console API** enabled
- OAuth2 credentials (Client ID and Client Secret) configured for a Web application
- The website must be verified in [Google Search Console](https://search.google.com/search-console)
- Environment variables set (see below)

## Environment Variables

Ensure the following are set in `.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_SITE_URL=https://gul-tekinmuhendislik.com
```

For local development, `NEXT_PUBLIC_SITE_URL` should be `http://localhost:3000`.

### Google Cloud Console Configuration

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID (Web application)
3. Add the following **Authorized redirect URIs**:

| Environment | Redirect URI |
|---|---|
| Development | `http://localhost:3000/api/search-console/callback` |
| Production | `https://gul-tekinmuhendislik.com/api/search-console/callback` |

4. Enable the **Google Search Console API** from [APIs & Services → Library](https://console.cloud.google.com/apis/library)

## First-Time Setup

### 1. Verify OAuth Redirect URIs

Navigate to `/api/debug-oauth` in the browser. This page displays the configured redirect URI. Verify it matches what's registered in Google Cloud Console.

### 2. Create Database Tables

Navigate to `/api/search-console/setup` in the browser (or visit the admin page and follow the prompt). This creates the following tables:

| Table | Purpose | Created By |
|---|---|---|
| `seo_performance` | Daily performance data by query, page, device, country | Setup API (dynamic) |
| `seo_keywords` | Keyword ranking data | Setup API (dynamic) |
| `seo_sitemaps` | Sitemap submission status | Setup API (dynamic) |
| `seo_pages` | Page-level analytics | Prisma schema (existing) |
| `seo_errors` | Crawl error data | Prisma schema (existing) |
| `seo_backlinks` | Backlink data | Prisma schema (existing) |

### 3. Authenticate with Google

1. Navigate to `/admin/seo`
2. Click **"Google ile Yetkilendir"** (Authorize with Google)
3. Complete the Google OAuth consent screen, granting access to Search Console data
4. You'll be redirected back to the admin page
5. The OAuth token is stored in the `google_tokens` table with `platform='search_console'`

### 4. Verify Authentication

Navigate to `/api/search-console/analytics?action=sites`. A successful response shows your verified sites.

## Daily Sync

### Manual Sync

On the admin dashboard (`/admin/seo`), click **"🔄 Senkronize Et"** (Sync) to fetch and store the latest Search Console data. This:

- Fetches daily performance data (date, query, page, device dimensions)
- Upserts into the `seo_performance` table
- Skips dates that already have data (no duplicates)
- Refreshes the dashboard charts and metrics

### API Endpoint

You can also trigger a sync programmatically:

```bash
curl -X POST https://gul-tekinmuhendislik.com/api/search-console/sync \
  -H "Content-Type: application/json" \
  -d '{"days": 28}'
```

**Request body (optional):**
- `days` — Number of days to sync (default: 28, max: 365)

**Response:**
```json
{
  "success": true,
  "synced": 1250,
  "dateRange": {
    "start": "2026-04-28",
    "end": "2026-05-26"
  },
  "totalApiCalls": 3,
  "pagesFetched": 1,
  "skippedDuplicateDates": ["2026-04-28"],
  "totalRowsFromApi": 1250
}
```

### Sync Status

`GET /api/search-console/sync` returns current storage stats:

```json
{
  "success": true,
  "status": {
    "totalRows": 12500,
    "earliestDate": "2026-04-01",
    "latestDate": "2026-05-26",
    "daysWithData": 56
  }
}
```

## Admin Dashboard

### URL

`/admin/seo`

### Tabs

| Tab | Content |
|---|---|
| 📊 **Performans** | Top queries table + Top pages table |
| 📈 **Trendler** | Daily trend charts for clicks, impressions, CTR, and position |
| 📱 **Mobil** | Mobile vs Desktop vs Tablet comparison |
| 🗺️ **Sitemaps** | Sitemap submission status and re-submit button |
| 🔍 **İndeksleme** | Indexing status information |

### Date Range Selector

Toggle between 7, 14, 28, or 90-day windows. All charts and tables update automatically.

### Summary Cards

Shows current totals for:
- **Tıklamalar** (Clicks)
- **Gösterimler** (Impressions)
- **TO** — Tıklama Oranı (CTR)
- **Sıralama** — Ortalama Pozisyon (Avg Position)

## Database Tables

### seo_performance

```sql
CREATE TABLE seo_performance (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  query TEXT,
  page TEXT,
  device TEXT DEFAULT 'DESKTOP',
  country TEXT DEFAULT 'TR',
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DOUBLE PRECISION DEFAULT 0,
  position DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (date, query, page, device, country)
);
```

The unique constraint on `(date, query, page, device, country)` prevents duplicate records across sync operations. Data is upserted using `ON CONFLICT DO UPDATE`.

## Token Management

- Tokens are stored in the `google_tokens` table with `platform='search_console'`
- Automatic token refresh is handled by the `google-auth-library` client
- Refreshed tokens are persisted back to the database
- If the token expires and cannot be refreshed, re-authenticate via the admin page

### Re-authentication

If the token becomes invalid:

1. Visit `/admin/seo`
2. If the page shows an authentication prompt, click **"Google ile Yetkilendir"**
3. Complete the OAuth flow again
4. The old token is replaced with a new one

Alternatively, delete the old token from the database:

```sql
DELETE FROM google_tokens WHERE platform = 'search_console';
```

Then re-authenticate from the admin page.

## Troubleshooting

### "No Search Console token found"

Run the OAuth flow by visiting `/admin/seo` and clicking the authorization button, or navigate directly to `/api/search-console/auth`.

### "Token has expired"

The automatic refresh should handle this. If it doesn't, re-authenticate by visiting `/api/search-console/auth`.

### API returns 401

Verify the redirect URI matches what's configured in Google Cloud Console. Use `/api/debug-oauth` to check the expected URI.

### Sync returns 0 rows

If all dates already have data in `seo_performance`, no new API calls are made. This is intentional to conserve API quota. Extend the date range or wait for new data to accumulate.

## API Routes Reference

| Route | Method | Purpose |
|---|---|---|
| `/api/search-console/auth` | GET | Initiate OAuth2 flow |
| `/api/search-console/callback` | GET | OAuth2 callback (handles token) |
| `/api/search-console/setup` | GET | Create database tables |
| `/api/search-console/analytics` | GET | Fetch analytics data (performance, sites, mobile, sitemaps, indexing) |
| `/api/search-console/analytics` | POST | Submit sitemap or request indexing |
| `/api/search-console/sync` | GET | Get sync status/stats |
| `/api/search-console/sync` | POST | Trigger manual sync |
| `/api/search-console/summary` | GET | SEO summary/feature overview |
| `/api/debug-oauth` | GET | Debug OAuth redirect URI configuration |
