import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  // const state = searchParams.get('state'); // TODO: Implement state validation
  const error = searchParams.get('error');

  // Hata kontrolü
  if (error) {
    console.error('Twitter OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/admin/twitter?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/admin/twitter?error=missing_code', request.url)
    );
  }

  try {
    // OAuth 2.0 token exchange
    const tokenUrl = 'https://api.twitter.com/2/oauth2/token';

    const params = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: process.env.TWITTER_OAUTH2_CLIENT_ID!,
      redirect_uri: process.env.NODE_ENV === 'production'
        ? 'https://ai.gul-tekinmuhendislik.com/api/auth/twitter/callback'
        : 'http://localhost:3000/api/auth/twitter/callback',
      code_verifier: 'challenge', // PKCE için gerekli
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.TWITTER_OAUTH2_CLIENT_ID}:${process.env.TWITTER_OAUTH2_CLIENT_SECRET}`
        ).toString('base64')}`
      },
      body: params
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenResponse.json();

    // User bilgilerini al
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();

    // Token'ları veritabanına kaydet
    await sql`
      INSERT INTO twitter_tokens (
        user_id,
        username,
        access_token,
        refresh_token,
        expires_at,
        scope,
        created_at,
        updated_at
      ) VALUES (
        ${userData.data.id},
        ${userData.data.username},
        ${tokenData.access_token},
        ${tokenData.refresh_token || null},
        ${new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()},
        ${tokenData.scope},
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        scope = EXCLUDED.scope,
        updated_at = NOW()
    `;

    // Başarılı - admin paneline yönlendir
    return NextResponse.redirect(
      new URL('/admin/twitter?success=true', request.url)
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/admin/twitter?error=auth_failed', request.url)
    );
  }
}