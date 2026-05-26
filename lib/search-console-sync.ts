/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from 'googleapis';
import { sql } from '@/lib/db';

const GSC_API_ROW_LIMIT = 25000;
const MAX_API_CALLS = 50;

/**
 * Get the OAuth2 client for Search Console, handling token refresh.
 */
async function getOAuth2Client() {
  const redirectUri =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api/search-console/callback'
      : `${process.env.NEXT_PUBLIC_SITE_URL}/api/search-console/callback`;

  const tokenResult = await sql`
    SELECT access_token, refresh_token
    FROM google_tokens
    WHERE platform = 'search_console'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (tokenResult.length === 0) {
    throw new Error('No Search Console token found. Please authenticate first.');
  }

  const token = tokenResult[0];
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  oauth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
  });

  // Persist refreshed tokens back to the database
  oauth2Client.on('tokens', async (newTokens) => {
    if (newTokens.access_token) {
      const expiresAt = newTokens.expiry_date
        ? new Date(newTokens.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

      await sql`
        UPDATE google_tokens
        SET
          access_token = ${newTokens.access_token},
          refresh_token = COALESCE(${newTokens.refresh_token || null}, google_tokens.refresh_token),
          expires_at = ${expiresAt},
          updated_at = NOW()
        WHERE platform = 'search_console'
      `;
    }
  });

  return oauth2Client;
}

export interface SyncResult {
  synced: number;
  range: { start: string; end: string };
  totalApiCalls: number;
  pagesFetched: number;
  skippedDuplicateDates: string[];
  totalRowsFromApi: number;
}

/**
 * Sync Search Console performance data into the `seo_performance` table.
 *
 * Fetches daily performance data from the GSC API broken down by date, query, page,
 * and device dimensions, then upserts each row into the database.
 *
 * To conserve API quota, dates that already have rows in `seo_performance` are skipped.
 */
export async function syncSearchConsoleData(
  siteUrl: string,
  days: number = 28
): Promise<SyncResult> {
  const oauth2Client = await getOAuth2Client();
  const searchconsole = google.searchconsole({
    version: 'v1',
    auth: oauth2Client,
  });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  // Determine which dates already have rows in seo_performance
  const existingDatesResult = await sql`
    SELECT date
    FROM seo_performance
    WHERE date >= ${start}::date
      AND date <= ${end}::date
    GROUP BY date
  `;
  const fullySyncedDates = new Set(
    existingDatesResult.map((r: any) => {
      const d = r.date instanceof Date ? r.date : new Date(r.date);
      return d.toISOString().split('T')[0];
    })
  );

  // Build the full date range
  const allDates: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    allDates.push(cursor.toISOString().split('T')[0]);
    cursor.setDate(cursor.getDate() + 1);
  }

  const missingDates = allDates.filter((d) => !fullySyncedDates.has(d));
  const skippedDuplicateDates = allDates.filter((d) => fullySyncedDates.has(d));

  if (missingDates.length === 0) {
    return {
      synced: 0,
      range: { start, end },
      totalApiCalls: 0,
      pagesFetched: 0,
      skippedDuplicateDates,
      totalRowsFromApi: 0,
    };
  }

  // Fetch data from the GSC API with pagination
  const batchStartDate = missingDates[0];
  const batchEndDate = missingDates[missingDates.length - 1];

  let allRows: any[] = [];
  let totalApiCalls = 0;
  let startRow = 0;

  while (true) {
    if (totalApiCalls >= MAX_API_CALLS) {
      console.warn(
        `[search-console-sync] Reached max API calls (${MAX_API_CALLS}). Data may be incomplete.`
      );
      break;
    }

    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: batchStartDate,
        endDate: batchEndDate,
        dimensions: ['date', 'query', 'page', 'device'],
        aggregationType: 'byPage',
        rowLimit: GSC_API_ROW_LIMIT,
        startRow,
      },
    });

    totalApiCalls++;
    const rows = response.data.rows || [];

    if (rows.length === 0) break;

    allRows = allRows.concat(rows);

    // If we got fewer rows than the limit, we've paginated through all data
    if (rows.length < GSC_API_ROW_LIMIT) break;

    startRow += GSC_API_ROW_LIMIT;
  }

  // Upsert each row individually (matching the existing codebase pattern)
  let syncedCount = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const batch = allRows.slice(i, i + BATCH_SIZE);

    // Execute batch of upserts concurrently using Promise.all
    await Promise.all(
      batch.map(async (row) => {
        const keys = row.keys || [];
        const dateKey = keys[0] || null;
        const queryKey = keys[1] || null;
        const pageKey = keys[2] || null;
        const deviceKey = keys[3] || 'DESKTOP';

        await sql`
          INSERT INTO seo_performance (date, query, page, device, country, clicks, impressions, ctr, position)
          VALUES (
            ${dateKey}::date,
            ${queryKey},
            ${pageKey},
            ${deviceKey},
            'TR',
            ${row.clicks || 0},
            ${row.impressions || 0},
            ${row.ctr || 0},
            ${row.position || 0}
          )
          ON CONFLICT (date, query, page, device, country) DO UPDATE SET
            clicks = EXCLUDED.clicks,
            impressions = EXCLUDED.impressions,
            ctr = EXCLUDED.ctr,
            position = EXCLUDED.position
        `;
      })
    );

    syncedCount += batch.length;
  }

  return {
    synced: syncedCount,
    range: { start, end },
    totalApiCalls,
    pagesFetched: Math.ceil(allRows.length / GSC_API_ROW_LIMIT),
    skippedDuplicateDates,
    totalRowsFromApi: allRows.length,
  };
}
