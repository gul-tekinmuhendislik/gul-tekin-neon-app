import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const redirectUri = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api/search-console/callback'
  : `${process.env.NEXT_PUBLIC_SITE_URL}/api/search-console/callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

export async function GET() {
  // Search Console API için gerekli scope'lar
  const scopes = [
    'https://www.googleapis.com/auth/webmasters.readonly', // Okuma izni
    'https://www.googleapis.com/auth/webmasters'          // Tam erişim
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  return NextResponse.redirect(authUrl);
}