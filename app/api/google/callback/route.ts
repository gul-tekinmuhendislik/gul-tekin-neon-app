import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

// Development'ta localhost kullan
const redirectUri = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api/google/callback'
  : `${process.env.NEXT_PUBLIC_SITE_URL}/api/google/callback`;

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
    return NextResponse.redirect(`${baseUrl}/admin/gmb?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/admin/gmb?error=no_code`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Token'ları cookie'ye kaydet
    const cookieStore = await cookies();
    cookieStore.set('gmb_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    if (tokens.refresh_token) {
      cookieStore.set('gmb_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 gün
      });
    }

    const redirectUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/admin/gmb?success=true'
      : `${process.env.NEXT_PUBLIC_SITE_URL}/admin/gmb?success=true`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(`${baseUrl}/admin/gmb?error=token_error`);
  }
}