import { NextResponse } from 'next/server';
import { 
  getHizmetler,
  syncHizmetlerToNeon,
  getHizmetlerFromNeon
} from '@/lib/airtable-hizmetler-client';
import { inngest } from '@/lib/inngest/client';

// GET /api/airtable-hizmetler - Get Hizmetler data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'neon'; // 'airtable' or 'neon'
    
    if (source === 'airtable') {
      // Get directly from Airtable
      const hizmetler = await getHizmetler();
      
      return NextResponse.json({
        success: true,
        source: 'airtable',
        data: hizmetler,
        count: hizmetler.length
      });
    } else {
      // Get from Neon database (default)
      const hizmetler = await getHizmetlerFromNeon();
      
      return NextResponse.json({
        success: true,
        source: 'neon',
        data: hizmetler,
        count: hizmetler.length
      });
    }
  } catch (error) {
    console.error('Hizmetler API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Hizmetler data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/airtable-hizmetler - Trigger manual sync
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;
    
    if (action === 'sync') {
      // Trigger immediate sync
      console.log('Triggering manual Hizmetler sync...');
      
      // Option 1: Direct sync (immediate)
      if (body.immediate) {
        const result = await syncHizmetlerToNeon();
        
        return NextResponse.json({
          success: true,
          message: 'Sync completed immediately',
          result
        });
      }
      
      // Option 2: Via Inngest (queued)
      await inngest.send({
        name: "hizmetler/sync.requested",
        data: {
          userId: body.userId || 'api',
          timestamp: new Date().toISOString()
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Sync request queued successfully'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: sync'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Hizmetler sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger sync',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}