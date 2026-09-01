import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const aktif = searchParams.get('aktif') !== 'false';

    const urunler = await sql`
      SELECT id, urun_adi, slug, marka, kategori, cloudinary_url, gorsel_url
      FROM urunler
      WHERE aktif = ${aktif}
        AND slug IS NOT NULL
        AND slug != ''
      ORDER BY urun_adi
      LIMIT ${limit}
    `;

    return NextResponse.json({
      success: true,
      count: urunler.length,
      urunler: urunler
    });
  } catch (error) {
    console.error('Ürünler alınırken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Ürünler alınamadı' },
      { status: 500 }
    );
  }
}
