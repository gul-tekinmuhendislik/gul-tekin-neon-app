import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Development'ta localhost kullan
const redirectUri = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3003/api/google/callback'
  : `${process.env.NEXT_PUBLIC_SITE_URL}/api/google/callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

export async function GET() {
  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  return NextResponse.redirect(authUrl);
}