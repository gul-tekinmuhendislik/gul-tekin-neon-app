import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN image_sync_status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN cloudinary_resim_url IS NOT NULL THEN 1 END) as has_cloudinary
      FROM projeler_gul_tekin
    `;
    
    return NextResponse.json({
      success: true,
      stats: result[0]
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}