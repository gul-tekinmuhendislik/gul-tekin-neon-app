import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Check columns in generated_content table
    const columns = await sql`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'generated_content'
      ORDER BY ordinal_position
    `;

    // Try to get a sample row
    const sample = await sql`
      SELECT * FROM generated_content
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      totalColumns: columns.length,
      columns: columns.map(c => ({
        name: c.column_name,
        type: c.data_type,
        nullable: c.is_nullable,
        default: c.column_default
      })),
      sampleRow: sample.length > 0 ? Object.keys(sample[0]) : []
    });
  } catch (error) {
    console.error("Error checking generated_content columns:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}