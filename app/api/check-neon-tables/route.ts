import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Get all tables in the database
    const tables = await sql`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    // Get row counts for each table
    const tableStats = [];
    
    for (const table of tables) {
      try {
        const countResult = await sql`
          SELECT COUNT(*) as row_count 
          FROM ${sql(table.table_name)}
        `;
        
        tableStats.push({
          name: table.table_name,
          type: table.table_type,
          rows: parseInt(countResult[0].row_count)
        });
      } catch (error) {
        tableStats.push({
          name: table.table_name,
          type: table.table_type,
          rows: 'Error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Get specific table structures for main tables
    const mainTables = ['projeler', 'markalar', 'hizmetler'];
    const tableStructures: Record<string, unknown> = {};
    
    for (const tableName of mainTables) {
      try {
        const columns = await sql`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_name = ${tableName}
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `;
        
        tableStructures[tableName] = columns;
      } catch (error) {
        tableStructures[tableName] = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    return NextResponse.json({
      success: true,
      totalTables: tables.length,
      tables: tableStats,
      tableStructures
    });
    
  } catch (error) {
    console.error('Error checking Neon tables:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}