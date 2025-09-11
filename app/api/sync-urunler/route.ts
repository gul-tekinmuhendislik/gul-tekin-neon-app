import { NextResponse } from 'next/server';
import { syncUrunlerToNeon } from '@/lib/airtable-urunler-client';
import { inngest } from '@/lib/inngest/client';

export async function POST() {
  try {
    console.log('Manual Urunler sync requested via API');
    
    // Trigger the Inngest function for manual sync
    await inngest.send({
      name: "urunler/sync.requested",
      data: {
        source: 'api_manual',
        userId: 'api_user',
        timestamp: new Date().toISOString()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Urunler sync job triggered successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error triggering Urunler sync:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger Urunler sync',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Direct Urunler sync requested via API');
    
    // Perform direct sync (for testing purposes)
    const result = await syncUrunlerToNeon();
    
    return NextResponse.json({
      ...result,
      message: 'Urunler sync completed successfully'
    });
    
  } catch (error) {
    console.error('Error during direct Urunler sync:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync Urunler',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}