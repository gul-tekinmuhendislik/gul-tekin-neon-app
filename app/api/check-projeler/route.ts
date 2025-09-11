import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Get statistics about projeler
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN aktif = true THEN 1 END) as active,
        COUNT(CASE WHEN onemli = true THEN 1 END) as featured,
        COUNT(CASE WHEN resim_url IS NOT NULL THEN 1 END) as with_image,
        COUNT(CASE WHEN array_length(galeri, 1) > 0 THEN 1 END) as with_gallery,
        COUNT(CASE WHEN array_length(markalar, 1) > 0 THEN 1 END) as with_brands,
        COUNT(CASE WHEN array_length(hizmetler, 1) > 0 THEN 1 END) as with_services
      FROM projeler
    `;
    
    // Get sample projects
    const samples = await sql`
      SELECT 
        isim,
        slug,
        musteri,
        konum,
        kategori,
        onemli,
        array_length(galeri, 1) as gallery_count,
        markalar,
        hizmetler
      FROM projeler
      WHERE aktif = true
      ORDER BY onemli DESC, sira ASC
      LIMIT 5
    `;
    
    return NextResponse.json({
      success: true,
      stats: stats[0],
      samples,
    });
  } catch (error) {
    console.error('Error checking projeler:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}