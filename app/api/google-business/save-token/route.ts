import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Cookie'den token'ları al
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('gmb_access_token')?.value;
    const refreshToken = cookieStore.get('gmb_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'No access token found in cookies'
      }, { status: 400 });
    }

    // Token'ı veritabanına kaydet
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Default 1 saat

    const result = await sql`
      INSERT INTO google_tokens (
        platform,
        access_token,
        refresh_token,
        expires_at
      ) VALUES (
        'google_business',
        ${accessToken},
        ${refreshToken || null},
        ${expiresAt}
      )
      ON CONFLICT (platform) DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = COALESCE(EXCLUDED.refresh_token, google_tokens.refresh_token),
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW()
      RETURNING id, platform, expires_at
    `;

    return NextResponse.json({
      success: true,
      message: 'Token saved to database successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error saving token:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save token'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Mevcut token'ı kontrol et
    const result = await sql`
      SELECT
        platform,
        expires_at,
        created_at,
        updated_at,
        CASE
          WHEN expires_at > NOW() THEN true
          ELSE false
        END as is_valid
      FROM google_tokens
      WHERE platform = 'google_business'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No token found in database',
        needsAuth: true
      });
    }

    return NextResponse.json({
      success: true,
      token: result[0]
    });
  } catch (error) {
    console.error('Error checking token:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check token'
    }, { status: 500 });
  }
}