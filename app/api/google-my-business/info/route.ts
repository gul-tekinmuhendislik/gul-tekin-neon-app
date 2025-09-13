import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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
      ? 'http://localhost:3002/api/google/callback'
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

    } catch (apiError: any) {
      // Eğer account bulunamazsa, Places API dene
      console.log('Trying Places API fallback...');

      const places = google.places({
        version: 'v1',
        auth: oauth2Client
      });

      return NextResponse.json({
        success: false,
        error: apiError.message,
        fallback: 'Places API can be used as alternative',
        details: apiError.response?.data
      });
    }

  } catch (error: any) {
    console.error('GMB Info API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch business information'
    }, { status: 500 });
  }
}