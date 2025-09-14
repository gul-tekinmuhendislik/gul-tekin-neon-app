import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Get vertex images statistics
    const stats = await sql`
      SELECT
        COUNT(*) as total_images,
        COUNT(DISTINCT metadata->>'topic') as unique_topics,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived
      FROM vertex_images
    `;

    // Get recent images
    const recentImages = await sql`
      SELECT
        id,
        prompt,
        image_url,
        cloudinary_public_id,
        aspect_ratio,
        status,
        created_at
      FROM vertex_images
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Get service distribution
    const serviceDistribution = await sql`
      SELECT
        metadata->>'service' as service,
        metadata->>'slug' as slug,
        COUNT(*) as count
      FROM vertex_images
      WHERE metadata->>'service' IS NOT NULL
      GROUP BY metadata->>'service', metadata->>'slug'
      ORDER BY count DESC
    `;

    // Check 15-minute cron job execution
    const cronLogs = await sql`
      SELECT
        event_name,
        status,
        payload,
        created_at
      FROM event_logs
      WHERE event_name = 'vertex-ai.15min.generation'
      ORDER BY created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      stats: stats[0],
      recentImages: recentImages.map(img => ({
        id: img.id,
        prompt: img.prompt?.substring(0, 100) + "...",
        imageUrl: img.image_url,
        cloudinaryId: img.cloudinary_public_id,
        aspectRatio: img.aspect_ratio,
        status: img.status,
        createdAt: img.created_at
      })),
      serviceDistribution,
      cronJobExecutions: cronLogs.map(log => ({
        status: log.status,
        service: log.payload?.service,
        slug: log.payload?.slug,
        createdAt: log.created_at
      }))
    });
  } catch (error) {
    console.error("Error checking vertex images:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}