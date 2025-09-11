import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    console.log('Manual URUNLER image sync requested via API');
    
    // Trigger the Inngest function for bulk image sync
    await inngest.send({
      name: "airtable/urunler.images.bulk_sync",
      data: {
        source: 'api_manual',
        timestamp: new Date().toISOString()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'URUNLER image sync job triggered successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error triggering URUNLER image sync:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger URUNLER image sync',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Checking URUNLER image sync status');
    
    // Get sync status
    const result = await sql`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN gorsel_url IS NOT NULL THEN 1 END) as with_images,
        COUNT(CASE WHEN cloudinary_url IS NOT NULL THEN 1 END) as with_cloudinary,
        COUNT(CASE WHEN gorsel_url IS NOT NULL AND (cloudinary_url IS NULL OR LENGTH(cloudinary_url) = 0) THEN 1 END) as need_sync
      FROM urunler
      WHERE aktif = true
    `;
    
    return NextResponse.json({
      success: true,
      status: {
        totalProducts: result[0].total_products,
        withImages: result[0].with_images,
        withCloudinary: result[0].with_cloudinary,
        needingSync: result[0].need_sync
      },
      message: `${result[0].need_sync} products need image sync`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error checking URUNLER image sync status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check URUNLER image sync status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}