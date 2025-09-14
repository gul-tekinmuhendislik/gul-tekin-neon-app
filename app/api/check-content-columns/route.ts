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

    // Get a sample content record
    const sampleContent = await sql`
      SELECT *
      FROM generated_content
      LIMIT 1
    `;

    // Check if specific columns exist
    const requiredColumns = [
      'id', 'topic', 'title', 'slug',
      'meta_title', 'meta_description', 'keywords',
      'content', 'status', 'created_at', 'updated_at'
    ];

    const missingColumns = requiredColumns.filter(col =>
      !columns.some(c => c.column_name === col)
    );

    return NextResponse.json({
      success: true,
      totalColumns: columns.length,
      columns: columns.map(c => ({
        name: c.column_name,
        type: c.data_type
      })),
      missingColumns,
      sampleData: sampleContent.length > 0 ? Object.keys(sampleContent[0]) : []
    });
  } catch (error) {
    console.error("Error checking columns:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}