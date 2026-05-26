/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { syncSearchConsoleData } from '@/lib/search-console-sync';

/**
 * POST /api/search-console/sync
 *
 * Manually triggers a sync of Search Console performance data into
 * the `seo_performance` table for historical trend analysis.
 *
 * Request body (optional):
 *   { days: number } — number of days to sync (default: 28)
 *
 * Response:
 *   { success: true, synced: number, dateRange: { start, end } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const days = typeof body.days === 'number' && body.days > 0 && body.days <= 365
      ? body.days
      : 28;

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://gul-tekinmuhendislik.com';

    const result = await syncSearchConsoleData(siteUrl, days);

    return NextResponse.json({
      success: true,
      synced: result.synced,
      dateRange: result.range,
      totalApiCalls: result.totalApiCalls,
      pagesFetched: result.pagesFetched,
      skippedDuplicateDates: result.skippedDuplicateDates,
      totalRowsFromApi: result.totalRowsFromApi,
    });
  } catch (error) {
    console.error('Search Console Sync Error:', error);

    const message = (error as Error)?.message || 'Failed to sync Search Console data';

    // If no token found, return 401 with auth URL
    if (message.includes('No Search Console token')) {
      return NextResponse.json(
        {
          success: false,
          error: message,
          authUrl: '/api/search-console/auth',
          message: 'Please authenticate with Search Console first',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        details: (error as any)?.response?.data,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search-console/sync
 *
 * Returns the sync status without triggering a full sync.
 * Useful for checking when data was last synced.
 */
export async function GET() {
  try {
    const statsResult = await sql`
      SELECT
        COUNT(*) as total_rows,
        MIN(date) as earliest_date,
        MAX(date) as latest_date,
        COUNT(DISTINCT date) as days_with_data
      FROM seo_performance
    `;

    const stats = statsResult[0];

    return NextResponse.json({
      success: true,
      status: {
        totalRows: Number(stats.total_rows),
        earliestDate: stats.earliest_date,
        latestDate: stats.latest_date,
        daysWithData: Number(stats.days_with_data),
      },
    });
  } catch (error) {
    console.error('Search Console Sync Status Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || 'Failed to get sync status',
      },
      { status: 500 }
    );
  }
}
