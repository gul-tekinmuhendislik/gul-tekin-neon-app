import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

export async function POST() {
  try {
    // Trigger the sync function manually
    const event = await inngest.send({
      name: "google-business/sync.manual",
      data: {
        triggered_by: "manual",
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Google Business sync triggered successfully",
      event_id: event.ids,
      note: "Check Inngest dashboard for progress"
    });
  } catch (error: any) {
    console.error('Error triggering Google Business sync:', error);
    return NextResponse.json(
      {
        error: 'Failed to trigger sync',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check current Google Business data in database
    const { sql } = await import('@/lib/db');

    const tokens = await sql`
      SELECT
        platform,
        access_token IS NOT NULL as has_token,
        refresh_token IS NOT NULL as has_refresh,
        expires_at,
        created_at,
        updated_at
      FROM google_tokens
      WHERE platform = 'google_business'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const locations = await sql`
      SELECT COUNT(*) as count
      FROM google_business_locations
    `;

    const reviews = await sql`
      SELECT COUNT(*) as count
      FROM google_business_reviews
    `;

    return NextResponse.json({
      tokens: tokens.length > 0 ? tokens[0] : null,
      locations_count: locations[0].count,
      reviews_count: reviews[0].count,
      sync_available: tokens.length > 0,
      throttle_config: {
        limit: 10,
        period: "1 minute",
        note: "API is throttled to 10 requests per minute"
      }
    });
  } catch (error: any) {
    console.error('Error checking Google Business status:', error);
    return NextResponse.json(
      {
        error: 'Failed to check status',
        details: error.message
      },
      { status: 500 }
    );
  }
}