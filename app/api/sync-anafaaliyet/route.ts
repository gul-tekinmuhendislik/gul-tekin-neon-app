import { NextResponse } from 'next/server';
import { syncAnafaaliyetToNeon } from '@/lib/airtable-anafaaliyet-client';
import { inngest } from '@/lib/inngest/client';

export async function POST() {
  try {
    console.log('Manual AnafaaLiyet sync requested via API');
    
    // Trigger the Inngest function for manual sync
    await inngest.send({
      name: "anafaaliyet/sync.requested",
      data: {
        source: 'api_manual',
        userId: 'api_user',
        timestamp: new Date().toISOString()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'AnafaaLiyet sync job triggered successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error triggering AnafaaLiyet sync:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger AnafaaLiyet sync',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Direct AnafaaLiyet sync requested via API');
    
    // Perform direct sync (for testing purposes)
    const result = await syncAnafaaliyetToNeon();
    
    return NextResponse.json({
      ...result,
      message: 'AnafaaLiyet sync completed successfully'
    });
    
  } catch (error) {
    console.error('Error during direct AnafaaLiyet sync:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync AnafaaLiyet',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}