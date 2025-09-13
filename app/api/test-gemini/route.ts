import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

export async function POST() {
  try {
    const event = await inngest.send({
      name: "google.gemini.test",
      data: {
        prompt: "Gül-Tekin Mühendislik'in sunduğu ana hizmetler nelerdir? Kısa bir liste halinde açıkla."
      }
    });

    return NextResponse.json({
      success: true,
      message: "Gemini test event sent successfully",
      eventId: event.ids
    });
  } catch (error) {
    console.error("Error sending test event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send test event" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to trigger Gemini test",
    endpoint: "/api/test-gemini"
  });
}