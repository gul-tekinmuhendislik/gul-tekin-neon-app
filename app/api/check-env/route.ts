import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    cloudinary: {
      cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: !!process.env.CLOUDINARY_API_KEY,
      apiSecret: !!process.env.CLOUDINARY_API_SECRET,
    },
    inngest: {
      eventKey: !!process.env.INNGEST_EVENT_KEY,
      signingKey: !!process.env.INNGEST_SIGNING_KEY,
    },
    ai: {
      googleGeminiApiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
      falAiKey: !!process.env.FAL_AI_KEY,
    }
  };

  const allRequired = Object.values(envCheck).every(section => 
    Object.values(section).every(exists => exists)
  );

  return NextResponse.json({
    success: allRequired,
    message: allRequired ? 'All environment variables are configured' : 'Some environment variables are missing',
    details: envCheck,
    missing: {
      cloudinary: Object.entries(envCheck.cloudinary)
        .filter(([, exists]) => !exists)
        .map(([key]) => `CLOUDINARY_${key.toUpperCase().replace('NAME', 'CLOUD_NAME')}`),
      inngest: Object.entries(envCheck.inngest)
        .filter(([, exists]) => !exists)
        .map(([key]) => `INNGEST_${key.toUpperCase()}`),
      ai: Object.entries(envCheck.ai)
        .filter(([, exists]) => !exists)
        .map(([key]) => key === 'googleGeminiApiKey' ? 'GOOGLE_GEMINI_API_KEY' : 'FAL_AI_KEY'),
    }
  });
}