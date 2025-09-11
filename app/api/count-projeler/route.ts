import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Count total records
    const totalCount = await sql`SELECT COUNT(*) as count FROM projeler`;
    
    // Count records with names
    const withNamesCount = await sql`
      SELECT COUNT(*) as count 
      FROM projeler 
      WHERE isim IS NOT NULL AND isim != ''
    `;
    
    // Get sample records
    const sampleRecords = await sql`
      SELECT id, airtable_id, isim, slug, konum, tarih
      FROM projeler
      ORDER BY id DESC
      LIMIT 5
    `;
    
    // Get latest record
    const latestRecord = await sql`
      SELECT id, airtable_id, isim, olusturma_tarihi
      FROM projeler
      ORDER BY olusturma_tarihi DESC
      LIMIT 1
    `;
    
    return NextResponse.json({
      success: true,
      totalRecords: parseInt(totalCount[0].count),
      recordsWithNames: parseInt(withNamesCount[0].count),
      sampleRecords,
      latestRecord: latestRecord[0] || null,
      message: totalCount[0].count == 0 ? 'Table is empty' : `Found ${totalCount[0].count} records`
    });
    
  } catch (error) {
    console.error('Error counting projeler:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}