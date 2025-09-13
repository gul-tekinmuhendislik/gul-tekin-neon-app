import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 1. Cookie'den token kontrolü
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('gmb_access_token')?.value;
    const refreshToken = cookieStore.get('gmb_refresh_token')?.value;

    // 2. Veritabanından token kontrolü
    const dbTokens = await sql`
      SELECT
        platform,
        access_token,
        refresh_token,
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

    // 3. Token durumu özeti
    const tokenStatus = {
      cookieTokenExists: !!accessToken,
      cookieRefreshTokenExists: !!refreshToken,
      dbTokenExists: dbTokens.length > 0,
      dbTokenValid: dbTokens.length > 0 && dbTokens[0].is_valid,
      dbTokenDetails: dbTokens.length > 0 ? {
        hasAccessToken: !!dbTokens[0].access_token,
        hasRefreshToken: !!dbTokens[0].refresh_token,
        expiresAt: dbTokens[0].expires_at,
        isValid: dbTokens[0].is_valid,
        createdAt: dbTokens[0].created_at,
        updatedAt: dbTokens[0].updated_at
      } : null
    };

    // 4. Token yenileme gereksinimi
    const needsRefresh = dbTokens.length > 0 && !dbTokens[0].is_valid && dbTokens[0].refresh_token;
    const needsNewAuth = !tokenStatus.dbTokenExists || (!tokenStatus.dbTokenValid && !dbTokens[0]?.refresh_token);

    return NextResponse.json({
      success: true,
      tokenStatus,
      recommendations: {
        needsRefresh,
        needsNewAuth,
        message: needsNewAuth
          ? 'Yeni yetkilendirme gerekiyor. /api/google/auth endpoint\'ini kullanın.'
          : needsRefresh
            ? 'Token yenilenmesi gerekiyor.'
            : 'Token geçerli ve kullanılabilir.'
      }
    });
  } catch (error) {
    console.error('Error checking token:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check token status'
    }, { status: 500 });
  }
}