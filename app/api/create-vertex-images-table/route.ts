import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Create vertex_images table
    await sql`
      CREATE TABLE IF NOT EXISTS vertex_images (
        id SERIAL PRIMARY KEY,
        prompt TEXT NOT NULL,
        enhanced_prompt TEXT,
        image_url TEXT NOT NULL,
        cloudinary_public_id TEXT UNIQUE NOT NULL,
        cloudinary_urls JSONB DEFAULT '{}',
        responsive_urls JSONB DEFAULT '{}',
        model VARCHAR(100) DEFAULT 'imagen-3.0-generate-001',
        provider VARCHAR(50) DEFAULT 'vertex-ai',
        aspect_ratio VARCHAR(20) DEFAULT '16:9',
        width INTEGER,
        height INTEGER,
        format VARCHAR(20),
        bytes INTEGER,
        tags TEXT[],
        content_id INTEGER REFERENCES generated_content(id) ON DELETE SET NULL,
        generation_params JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'completed',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_vertex_images_cloudinary_public_id
      ON vertex_images(cloudinary_public_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_vertex_images_content_id
      ON vertex_images(content_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_vertex_images_created_at
      ON vertex_images(created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_vertex_images_status
      ON vertex_images(status)
    `;

    // Check if table was created successfully
    const tableInfo = await sql`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'vertex_images'
      ORDER BY ordinal_position
    `;

    return NextResponse.json({
      success: true,
      message: "vertex_images table created successfully",
      columns: tableInfo,
      indexes: [
        'idx_vertex_images_cloudinary_public_id',
        'idx_vertex_images_content_id',
        'idx_vertex_images_created_at',
        'idx_vertex_images_status'
      ]
    });
  } catch (error) {
    console.error("Error creating vertex_images table:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}