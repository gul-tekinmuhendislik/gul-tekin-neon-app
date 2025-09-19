import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // First, check the columns of style_presets table
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'style_presets'
      ORDER BY ordinal_position
    `;

    // Get all entries from style_presets
    const allEntries = await sql`
      SELECT * FROM style_presets
      ORDER BY name
    `;

    // Search for industrial/sanayi related terms in all text columns
    const results = await sql`
      SELECT *
      FROM style_presets
      WHERE
        prompt_template ILIKE '%sanayi%'
        OR prompt_template ILIKE '%industrial%'
        OR prompt_template ILIKE '%endüstri%'
        OR prompt_template ILIKE '%fabrika%'
        OR prompt_template ILIKE '%üretim%'
        OR prompt_template ILIKE '%makine%'
        OR prompt_template ILIKE '%factory%'
        OR prompt_template ILIKE '%manufacturing%'
        OR prompt_template ILIKE '%machine%'
        OR prompt_template ILIKE '%production%'
        OR name ILIKE '%sanayi%'
        OR name ILIKE '%industrial%'
        OR name ILIKE '%endüstri%'
        OR name ILIKE '%fabrika%'
        OR category ILIKE '%sanayi%'
        OR category ILIKE '%industrial%'
      ORDER BY name
    `;

    // Also get total count
    const totalCount = await sql`SELECT COUNT(*) as count FROM style_presets`;

    return NextResponse.json({
      table_columns: columns,
      total_entries: totalCount[0].count,
      all_entries_preview: allEntries.slice(0, 5),
      industrial_entries_found: results.length,
      industrial_entries: results
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking style_presets:', error);
    return NextResponse.json(
      { error: 'Failed to check style_presets', details: error.message },
      { status: 500 }
    );
  }
}