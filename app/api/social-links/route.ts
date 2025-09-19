import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`
      SELECT id, siteadi, url, kategori
      FROM sociallinks
      WHERE aktif = true
      ORDER BY sira ASC, siteadi ASC
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching social links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social links' },
      { status: 500 }
    );
  }
}