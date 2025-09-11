import { NextResponse } from 'next/server';
import { 
  getMarkalar,
  getActiveMarkalar,
  syncMarkalarToNeon,
  getMarkalarFromNeon
} from '@/lib/airtable-markalar-client';
import { inngest } from '@/lib/inngest/client';

// GET /api/airtable - Get Markalar data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'neon'; // 'airtable' or 'neon'
    const activeOnly = searchParams.get('active') === 'true';
    
    if (source === 'airtable') {
      // Get directly from Airtable
      const markalar = activeOnly ? await getActiveMarkalar() : await getMarkalar();
      
      return NextResponse.json({
        success: true,
        source: 'airtable',
        data: markalar,
        count: markalar.length
      });
    } else {
      // Get from Neon database (default)
      const markalar = await getMarkalarFromNeon();
      
      return NextResponse.json({
        success: true,
        source: 'neon',
        data: markalar,
        count: markalar.length
      });
    }
  } catch (error) {
    console.error('Markalar API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch Markalar data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/airtable - Trigger manual sync
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;
    
    if (action === 'sync') {
      // Trigger immediate sync
      console.log('Triggering manual Markalar sync...');
      
      // Option 1: Direct sync (immediate)
      if (body.immediate) {
        const result = await syncMarkalarToNeon();
        
        return NextResponse.json({
          success: true,
          message: 'Sync completed immediately',
          result
        });
      }
      
      // Option 2: Via Inngest (queued)
      await inngest.send({
        name: "markalar/sync.requested",
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
    console.error('Markalar sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to trigger sync',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}