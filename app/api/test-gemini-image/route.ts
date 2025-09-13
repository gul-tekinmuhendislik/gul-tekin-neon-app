import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prompt = "Modern mühendislik ofisi, profesyonel ekip çalışması",
      style = "photorealistic"
    } = body;

    // Gemini ile optimize edilmiş prompt ve resim üretimi
    const event = await inngest.send({
      name: "image.generate.gemini",
      data: {
        basePrompt: prompt,
        style: style,
        contentType: "test"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Gemini-optimized image generation started",
      eventId: event.ids,
      details: {
        originalPrompt: prompt,
        style: style,
        process: "Gemini prompt optimization → Fal.ai generation → Cloudinary upload"
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to trigger image generation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Google Gemini + Fal.ai Hybrid Image Generation",
    usage: {
      method: "POST",
      body: {
        prompt: "Your image description",
        style: "photorealistic | artistic | minimalist | professional"
      }
    },
    process: [
      "1. Gemini optimizes your prompt for better image generation",
      "2. Fal.ai generates the image with optimized prompt",
      "3. Image is uploaded to Cloudinary",
      "4. Result is saved to database"
    ],
    example: {
      prompt: "Gül-Tekin Mühendislik için modern ofis tasarımı",
      style: "professional"
    }
  });
}