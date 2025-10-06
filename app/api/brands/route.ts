import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const names = searchParams.get('names');

    if (!names) {
      return NextResponse.json(
        { success: false, error: 'Brand names parameter is required' },
        { status: 400 }
      );
    }

    const brandNames = names.split(',').map(name => name.trim());

    const result = await sql`
      SELECT
        marka_adi,
        slug,
        cloudinary_url
      FROM markalar
      WHERE marka_adi = ANY(${brandNames})
        AND aktif = true
      ORDER BY marka_adi
    `;

    return NextResponse.json({
      success: true,
      brands: result,
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
