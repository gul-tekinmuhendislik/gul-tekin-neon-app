import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contentId, batchProcess = false } = body;

    // Trigger Inngest function
    const result = await inngest.send({
      name: "content/generate-prompt.xai",
      data: {
        contentId,
        batchProcess
      }
    });

    return NextResponse.json({
      success: true,
      message: batchProcess 
        ? "Batch prompt generation initiated" 
        : contentId 
          ? `Prompt generation initiated for content ${contentId}`
          : "Prompt generation initiated for one content",
      eventId: result.ids[0]
    });

  } catch (error) {
    console.error("Error in generate prompts API:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate prompts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get stats about contents without prompts
    const stats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE prompt IS NULL) as without_prompt,
        COUNT(*) FILTER (WHERE prompt IS NOT NULL) as with_prompt,
        COUNT(*) as total
      FROM generated_content
    `;

    // Get recent contents without prompts
    const recentWithoutPrompts = await sql`
      SELECT id, topic, title, created_at
      FROM generated_content
      WHERE prompt IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      stats: {
        withoutPrompt: stats[0].without_prompt,
        withPrompt: stats[0].with_prompt,
        total: stats[0].total
      },
      recentWithoutPrompts: recentWithoutPrompts,
      endpoints: {
        generateOne: {
          method: "POST",
          description: "Generate prompt for one content without prompt",
          body: {}
        },
        generateSpecific: {
          method: "POST",
          description: "Generate prompt for specific content",
          body: {
            contentId: "number"
          }
        },
        generateBatch: {
          method: "POST",
          description: "Generate prompts for up to 10 contents",
          body: {
            batchProcess: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching prompt stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}