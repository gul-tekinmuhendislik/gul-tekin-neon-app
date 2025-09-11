import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { inngest } from '@/lib/inngest/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blogId, prompt, model, imageSize, numInferenceSteps, guidanceScale } = body;

    if (!blogId || !prompt) {
      return NextResponse.json(
        { error: 'blogId and prompt are required' },
        { status: 400 }
      );
    }

    // Blog'un var olduğunu kontrol et
    const blog = await sql`
      SELECT id, title, topic, status 
      FROM generated_content 
      WHERE id = ${blogId}
    `;

    if (blog.length === 0) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Inngest event'i gönder
    await inngest.send({
      name: "blog/image.generate.requested",
      data: {
        blogId: parseInt(blogId),
        prompt,
        model: model || "fal-ai/imagen4/preview/fast",
        imageSize: imageSize || "landscape_16_9",
        numInferenceSteps: numInferenceSteps || 4,
        guidanceScale: guidanceScale || 7.5
      }
    });

    return NextResponse.json({
      success: true,
      message: `Image generation started for blog: ${blog[0].title}`,
      blogId: blogId,
      prompt: prompt
    });

  } catch (error) {
    console.error('Error starting image generation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start image generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}