import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`
      SELECT
        id,
        siteadi,
        url,
        kategori,
        icon
      FROM sites_domain
      ORDER BY kategori, siteadi
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching sites domain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites domain' },
      { status: 500 }
    );
  }
}