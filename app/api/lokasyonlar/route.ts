import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const lokasyonlar = await sql`
      SELECT
        id,
        ilce_adi,
        slug,
        il,
        aciklama,
        resim_url,
        aktif,
        sira,
        created_at,
        updated_at
      FROM hizmet_lokasyonlari
      WHERE aktif = true
      ORDER BY sira ASC, ilce_adi ASC
    `;

    return NextResponse.json(lokasyonlar);
  } catch (error) {
    console.error('Lokasyonlar alınırken hata:', error);
    return NextResponse.json(
      { error: 'Lokasyonlar alınamadı' },
      { status: 500 }
    );
  }
}