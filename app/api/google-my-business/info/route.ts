import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Cookie'den token'ları al
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('gmb_access_token')?.value;
    const refreshToken = cookieStore.get('gmb_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        authUrl: '/api/google/auth'
      }, { status: 401 });
    }

    const redirectUri = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3003/api/google/callback'
      : `${process.env.NEXT_PUBLIC_SITE_URL}/api/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Direkt Business Information API kullan
    const mybusinessinformation = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: oauth2Client
    });

    try {
      // Önce account'ları manuel olarak listele
      const accountName = 'accounts/-'; // Tüm hesaplar için wildcard

      const locationsResponse = await mybusinessinformation.accounts.locations.list({
        parent: accountName,
        pageSize: 100,
      });

      return NextResponse.json({
        success: true,
        data: {
          locations: locationsResponse.data.locations || [],
          message: 'Business Information API response'
        }
      });

    } catch (apiError) {
      // Eğer account bulunamazsa, Places API dene
      console.log('Trying Places API fallback...');

      return NextResponse.json({
        success: false,
        error: apiError instanceof Error ? apiError.message : 'API error',
        fallback: 'Places API can be used as alternative',
        details: (apiError as { response?: { data: unknown } }).response?.data
      });
    }

  } catch (error) {
    console.error('GMB Info API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch business information'
    }, { status: 500 });
  }
}