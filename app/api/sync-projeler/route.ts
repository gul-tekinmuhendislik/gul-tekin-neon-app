import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import { syncProjelerToNeon } from '@/lib/airtable-projeler-client';

export async function GET() {
  try {
    // Direct sync without Inngest
    const result = await syncProjelerToNeon();
    
    return NextResponse.json({
      success: true,
      message: 'Projeler synced successfully',
      result,
    });
  } catch (error) {
    console.error('Error syncing projeler:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Trigger Inngest function
    const event = await inngest.send({
      name: "projeler/sync.requested",
      data: {
        triggeredBy: 'api',
        timestamp: new Date().toISOString(),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Projeler sync triggered via Inngest',
      eventId: event.ids[0],
    });
  } catch (error) {
    console.error('Error triggering projeler sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}