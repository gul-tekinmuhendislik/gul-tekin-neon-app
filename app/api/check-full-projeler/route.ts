import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Get projects with actual content
    const projects = await sql`
      SELECT 
        id,
        airtable_id,
        isim,
        slug,
        aciklama,
        musteri,
        konum,
        tarih,
        resim_url,
        kategori,
        array_length(hizmetler, 1) as services_count,
        array_length(galeri, 1) as gallery_count,
        etiketler
      FROM projeler
      WHERE isim IS NOT NULL AND isim != ''
      ORDER BY tarih DESC
      LIMIT 10
    `;
    
    // Get some stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN isim IS NOT NULL AND isim != '' THEN 1 END) as with_name,
        COUNT(CASE WHEN aciklama IS NOT NULL AND aciklama != '' THEN 1 END) as with_description,
        COUNT(CASE WHEN resim_url IS NOT NULL THEN 1 END) as with_image,
        COUNT(CASE WHEN tarih IS NOT NULL THEN 1 END) as with_date
      FROM projeler
    `;
    
    return NextResponse.json({
      success: true,
      stats: stats[0],
      projectsWithContent: projects,
    });
  } catch (error) {
    console.error('Error checking full projeler:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}