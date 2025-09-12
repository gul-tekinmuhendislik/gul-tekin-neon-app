import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function POST() {
  try {
    // Test event'i gönder
    const result = await inngest.send({
      name: "image/fal-ai.generate.requested",
      data: {
        prompt: "A modern HVAC system installation in a beautiful Mediterranean style villa in Bodrum, professional photography, architectural digest style, golden hour lighting",
        model: "fal-ai/imagen4/preview/fast",
        imageSize: "landscape_16_9",
        numInferenceSteps: 4,
        guidanceScale: 7.5,
        numImages: 1,
        enableSafetyChecker: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Fal.ai image generation event sent successfully",
      eventId: result.ids[0]
    });
  } catch (error) {
    console.error("Error sending Fal.ai event:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to trigger Fal.ai image generation",
    endpoint: "/api/test-fal-ai",
    method: "POST"
  });
}