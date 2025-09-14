import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { sql } from "@/lib/db";

// Test the 15-minute cron job manually
export async function GET() {
  try {
    // Trigger the 15-minute generation manually
    const event = await inngest.send({
      name: "vertex-ai/15min.manual",
      data: {
        manual: true
      }
    });

    // Get the last service that was generated
    const lastGenerated = await sql`
      SELECT metadata
      FROM vertex_images
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const lastServiceIndex = lastGenerated[0]?.metadata?.serviceIndex || 0;
    const nextServiceIndex = (lastServiceIndex + 1) % 13; // 13 services total

    // Check recent images
    const recentImages = await sql`
      SELECT id, prompt, cloudinary_public_id, created_at
      FROM vertex_images
      ORDER BY created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      message: "15-minute generation triggered manually",
      eventId: event.ids[0],
      lastServiceIndex,
      nextServiceIndex,
      recentImages: recentImages.map(img => ({
        id: img.id,
        prompt: img.prompt?.substring(0, 100) + "...",
        publicId: img.cloudinary_public_id,
        createdAt: img.created_at
      }))
    });
  } catch (error) {
    console.error("Error triggering hourly generation:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}