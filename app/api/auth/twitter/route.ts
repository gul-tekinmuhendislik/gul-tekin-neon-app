import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const clientId = process.env.TWITTER_OAUTH2_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Twitter OAuth2 not configured' },
      { status: 500 }
    );
  }

  // OAuth 2.0 parametreleri
  const redirectUri = process.env.NODE_ENV === 'production'
    ? 'https://gul-tekinmuhendislik.com/api/auth/twitter/callback'
    : 'http://localhost:3000/api/auth/twitter/callback';

  // State parametresi (CSRF koruması için)
  const state = crypto.randomBytes(32).toString('hex');

  // PKCE challenge
  const codeChallenge = 'challenge';

  // OAuth 2.0 URL'i oluştur
  const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access');
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'plain');

  // State'i session'a kaydet (gerçek uygulamada cookie veya db kullanın)
  // Bu basit örnek için state kontrolünü atlıyoruz

  return NextResponse.redirect(authUrl.toString());
}