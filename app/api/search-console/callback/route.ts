import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { sql } from '@/lib/db';

const redirectUri = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api/search-console/callback'
  : `${process.env.NEXT_PUBLIC_SITE_URL}/api/search-console/callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_SITE_URL;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/admin/seo?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/admin/seo?error=no_code`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Token'ı veritabanına kaydet
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await sql`
      INSERT INTO google_tokens (
        platform,
        access_token,
        refresh_token,
        expires_at
      ) VALUES (
        'search_console',
        ${tokens.access_token || ''},
        ${tokens.refresh_token || null},
        ${expiresAt}
      )
      ON CONFLICT (platform) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = COALESCE(EXCLUDED.refresh_token, google_tokens.refresh_token),
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
    `;

    return NextResponse.redirect(`${baseUrl}/admin/seo?success=true`);
  } catch (error) {
    console.error('Search Console OAuth callback error:', error);
    return NextResponse.redirect(`${baseUrl}/admin/seo?error=token_error`);
  }
}