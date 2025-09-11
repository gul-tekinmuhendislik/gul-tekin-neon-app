import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    console.log('🧪 Testing Inngest with metadata column...');
    
    // Test the generateEngineeringContent function by sending an event
    const eventResult = await inngest.send({
      name: "content/generate.test",
      data: {
        topic: "Isı Pompası Test",
        test: true,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('Event sent to Inngest:', eventResult);
    
    // Also test direct database insert to generated_content with metadata
    const testInsert = await sql`
      INSERT INTO generated_content (
        topic,
        title,
        content,
        meta_title,
        meta_description,
        keywords,
        status,
        metadata
      ) VALUES (
        'Test Topic',
        'Test Content Title', 
        'This is test content to verify metadata column is working.',
        'Test Meta Title',
        'Test meta description',
        ARRAY['test', 'metadata', 'column'],
        'draft',
        ${{
          test: true,
          created_by: 'api_test',
          timestamp: new Date().toISOString(),
          eeat_analysis: {
            overall_score: 85,
            test_mode: true
          }
        }}
      )
      RETURNING id, topic, metadata
    `;
    
    console.log('✅ Database insert with metadata successful');
    
    return NextResponse.json({
      success: true,
      message: 'Test completed successfully - metadata column is working!',
      results: {
        inngest_event: eventResult,
        database_test: {
          inserted_id: testInsert[0].id,
          topic: testInsert[0].topic,
          metadata: testInsert[0].metadata
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Test failed - metadata column issue may persist'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Inngest and metadata column test endpoint',
    usage: 'POST to run test',
    description: 'Tests if the metadata column fix resolved the NeonDbError'
  });
}