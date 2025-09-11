import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, brandId, size, style, generateActualImage = true } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Trigger Inngest function
    const event = await inngest.send({
      name: "image/generate.requested",
      data: {
        prompt,
        brandId,
        size: size || "1024x1024",
        style: style || "realistic",
        generateActualImage
      }
    });

    return NextResponse.json({
      success: true,
      message: "Image generation started",
      eventId: event.ids?.[0],
      data: {
        prompt,
        brandId,
        size: size || "1024x1024",
        style: style || "realistic",
        generateActualImage
      }
    });
  } catch (error) {
    console.error("Error triggering image generation:", error);
    return NextResponse.json(
      { 
        error: "Failed to start image generation",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Image Generation API",
    endpoints: {
      "POST /api/generate-image": {
        description: "Generate an enhanced image prompt using OpenRouter AI",
        body: {
          prompt: "Required - The base prompt for image generation",
          brandId: "Optional - Brand ID to associate with the image",
          size: "Optional - Image size (default: 1024x1024)",
          style: "Optional - Image style (default: realistic)"
        },
        example: {
          prompt: "A modern heat pump system in a luxury villa",
          brandId: "brand_123",
          size: "1024x1024",
          style: "photorealistic",
          generateActualImage: true
        },
        response: {
          success: true,
          message: "Image generation started",
          eventId: "event_id",
          data: {
            prompt: "string",
            brandId: "string",
            size: "string",
            style: "string",
            generateActualImage: "boolean"
          }
        }
      }
    }
  });
}