import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

function getOAuth2Client() {
  const redirectUri = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3003/api/google/callback'
    : `${process.env.NEXT_PUBLIC_SITE_URL}/api/google/callback`;

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

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

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    google.options({ auth: oauth2Client });

    const mybusinessaccountmanagement = google.mybusinessaccountmanagement('v1');

    switch (action) {
      case 'accounts':
        const accountsResponse = await mybusinessaccountmanagement.accounts.list();
        return NextResponse.json({
          success: true,
          data: accountsResponse.data
        });

      case 'locations':
        const accountId = searchParams.get('accountId');
        if (!accountId) {
          return NextResponse.json({
            success: false,
            error: 'Account ID required'
          }, { status: 400 });
        }

        const mybusinessinformation = google.mybusinessbusinessinformation('v1');
        const locationsResponse = await mybusinessinformation.accounts.locations.list({
          parent: accountId,
        });

        return NextResponse.json({
          success: true,
          data: locationsResponse.data
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('GMB OAuth API error:', error);

    // Token expired kontrolü
    if ((error as { code?: number }).code === 401) {
      return NextResponse.json({
        success: false,
        error: 'Token expired',
        authUrl: '/api/google/auth'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch GMB data'
    }, { status: 500 });
  }
}