import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    cloudinary: {
      cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: !!process.env.CLOUDINARY_API_KEY,
      apiSecret: !!process.env.CLOUDINARY_API_SECRET,
    },
    airtable: {
      apiKey: !!process.env.AIRTABLE_API_KEY,
      baseId: !!process.env.AIRTABLE_BASE_ID,
      markalarTableId: !!process.env.AIRTABLE_TABLE_ID_MARKALAR,
      hizmetlerTableId: !!process.env.AIRTABLE_TABLE_ID_HIZMETLER,
    },
    inngest: {
      eventKey: !!process.env.INNGEST_EVENT_KEY,
      signingKey: !!process.env.INNGEST_SIGNING_KEY,
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
      airtable: Object.entries(envCheck.airtable)
        .filter(([, exists]) => !exists)
        .map(([key]) => `AIRTABLE_${key.toUpperCase()}`),
      inngest: Object.entries(envCheck.inngest)
        .filter(([, exists]) => !exists)
        .map(([key]) => `INNGEST_${key.toUpperCase()}`),
    }
  });
}