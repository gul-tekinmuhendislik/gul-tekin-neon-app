import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Create social_media_posts table
    await sql`
      CREATE TABLE IF NOT EXISTS social_media_posts (
        id SERIAL PRIMARY KEY,
        content_id INTEGER NOT NULL,
        platform VARCHAR(50) NOT NULL,
        post_id VARCHAR(255),
        post_data JSONB NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        posted_at TIMESTAMP WITH TIME ZONE,
        scheduled_for TIMESTAMP WITH TIME ZONE,
        error_message TEXT,
        engagement_metrics JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(content_id, platform)
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_social_media_posts_content_id ON social_media_posts(content_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts(platform)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON social_media_posts(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_social_media_posts_posted_at ON social_media_posts(posted_at DESC)`;

    return NextResponse.json({
      success: true,
      message: "social_media_posts table created successfully"
    });
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { error: "Failed to create table", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}