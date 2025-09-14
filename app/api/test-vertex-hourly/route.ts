import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { sql } from "@/lib/db";

// Test the hourly cron job manually
export async function GET() {
  try {
    // Trigger the hourly generation event manually
    const event = await inngest.send({
      name: "vertex-ai/hourly.generate",
      data: {
        manual: true
      }
    });

    // Get the current hour's topic
    const hour = new Date().getHours();
    const topics = [
      "Isı Pompası Sistemleri",
      "Güneş Enerjisi",
      "Su Arıtma Sistemleri",
      "Klima Sistemleri",
      "Havuz Sistemleri",
      "Mekanik Tesisat"
    ];
    const topicIndex = hour % topics.length;
    const currentTopic = topics[topicIndex];

    // Check recent images
    const recentImages = await sql`
      SELECT id, prompt, cloudinary_public_id, created_at
      FROM vertex_images
      ORDER BY created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      message: "Hourly generation triggered manually",
      eventId: event.ids[0],
      currentHour: hour,
      expectedTopic: currentTopic,
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