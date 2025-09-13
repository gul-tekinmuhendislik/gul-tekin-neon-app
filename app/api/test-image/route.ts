import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt = "Modern mühendislik ofisi, profesyonel, yüksek teknoloji, minimalist tasarım" } = body;

    // Fal.ai ile resim üretimi için event gönder
    const event = await inngest.send({
      name: "image.generate.fal",
      data: {
        prompt,
        model: "fal-ai/imagen4/preview/fast",
        imageSize: "landscape_16_9",
        numImages: 1
      }
    });

    return NextResponse.json({
      success: true,
      message: "Image generation event sent",
      eventId: event.ids,
      prompt
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
    message: "POST method ile resim üretimi tetikleyebilirsiniz",
    example: {
      prompt: "Modern mühendislik ofisi"
    }
  });
}