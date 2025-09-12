import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Check if table exists
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'projeler_gul_tekin'
    `;
    
    if (tableCheck.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Table projeler_gul_tekin does not exist'
      });
    }
    
    // Get column information
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projeler_gul_tekin'
      ORDER BY ordinal_position
    `;
    
    // Get row count
    const countResult = await sql`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN aktif = true THEN 1 END) as active
      FROM projeler_gul_tekin
    `;
    
    // Get sample data - first check what columns we have
    const sampleData = await sql`
      SELECT *
      FROM projeler_gul_tekin
      LIMIT 5
    `;
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      columns: columns,
      stats: countResult[0],
      sampleData: sampleData
    });
    
  } catch (error) {
    console.error('Error checking projeler table:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}