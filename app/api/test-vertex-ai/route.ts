import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function GET() {
  try {
    // Test Vertex AI connection
    const testConnection = await inngest.send({
      name: "vertex-ai/test.connection",
      data: {}
    });

    return NextResponse.json({
      success: true,
      message: "Vertex AI test initiated",
      eventId: testConnection.ids[0],
      details: {
        project: process.env.GOOGLE_CLOUD_PROJECT || 'gul-tekin-muhendislik',
        location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
        model: 'imagen-3.0-generate-001'
      }
    });
  } catch (error) {
    console.error("Error testing Vertex AI:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, contentId, aspectRatio = "16:9" } = body;

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: "Prompt is required"
      }, { status: 400 });
    }

    // Trigger Vertex AI image generation
    const event = await inngest.send({
      name: contentId ? "blog/vertex-ai.image.generate.requested" : "image/vertex-ai.generate.requested",
      data: {
        prompt,
        contentId,
        aspectRatio,
        numberOfImages: 1,
        language: "en",
        safetySetting: "block_some",
        personGeneration: "dont_allow",
        addWatermark: false
      }
    });

    return NextResponse.json({
      success: true,
      message: "Vertex AI image generation triggered",
      eventId: event.ids[0],
      prompt: prompt.substring(0, 100) + "...",
      details: {
        model: 'imagen-3.0-generate-001',
        aspectRatio,
        contentId
      }
    });
  } catch (error) {
    console.error("Error triggering Vertex AI generation:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}