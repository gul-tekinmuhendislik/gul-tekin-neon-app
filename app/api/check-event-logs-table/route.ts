import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Check columns in event_logs table
    const columns = await sql`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'event_logs'
      ORDER BY ordinal_position
    `;

    // Get a sample event log
    const sampleLog = await sql`
      SELECT *
      FROM event_logs
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      totalColumns: columns.length,
      columns: columns.map(c => ({
        name: c.column_name,
        type: c.data_type
      })),
      sampleData: sampleLog.length > 0 ? Object.keys(sampleLog[0]) : []
    });
  } catch (error) {
    console.error("Error checking event_logs table:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}