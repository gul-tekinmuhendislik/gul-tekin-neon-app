import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`
      SELECT hizmet_adi
      FROM hizmetler
      WHERE aktif = true
      ORDER BY hizmet_adi
    `;

    const services = result.map(row => row.hizmet_adi);

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      services: ['Sıhhi tesisat', 'güneş enerjisi sistemleri', 'ısı pompası çözümleri']
    });
  }
}