import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  const isDev = process.env.NODE_ENV === 'development';

  // Her servis için redirect URI'leri
  const redirectURIs = {
    googleBusiness: {
      expected: isDev
        ? 'http://localhost:3000/api/google/callback'
        : `${process.env.NEXT_PUBLIC_SITE_URL}/api/google/callback`,
      oauth2Client: null as unknown
    },
    searchConsole: {
      expected: isDev
        ? 'http://localhost:3000/api/search-console/callback'
        : `${process.env.NEXT_PUBLIC_SITE_URL}/api/search-console/callback`,
      oauth2Client: null as unknown
    }
  };

  // Google Business OAuth2 Client
  const gmbOAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectURIs.googleBusiness.expected
  );

  // Search Console OAuth2 Client
  const scOAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectURIs.searchConsole.expected
  );

  // Auth URL'leri oluştur
  const gmbAuthUrl = gmbOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/business.manage'],
    prompt: 'consent',
  });

  const scAuthUrl = scOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/webmasters'
    ],
    prompt: 'consent',
  });

  // URL'lerden redirect_uri parametresini çıkar
  const extractRedirectUri = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('redirect_uri');
    } catch {
      return null;
    }
  };

  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      isDevelopment: isDev,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET
    },

    redirectURIs: {
      googleBusiness: {
        configured: redirectURIs.googleBusiness.expected,
        sentToGoogle: extractRedirectUri(gmbAuthUrl),
        matches: redirectURIs.googleBusiness.expected === extractRedirectUri(gmbAuthUrl)
      },
      searchConsole: {
        configured: redirectURIs.searchConsole.expected,
        sentToGoogle: extractRedirectUri(scAuthUrl),
        matches: redirectURIs.searchConsole.expected === extractRedirectUri(scAuthUrl)
      }
    },

    authURLs: {
      googleBusiness: {
        fullUrl: gmbAuthUrl,
        endpoint: '/api/google/auth'
      },
      searchConsole: {
        fullUrl: scAuthUrl,
        endpoint: '/api/search-console/auth'
      }
    },

    requiredGoogleConsoleSettings: {
      message: '⚠️ Google Cloud Console\'da bu URI\'lerin AYNEN ekli olması gerekiyor:',
      uris: [
        redirectURIs.googleBusiness.expected,
        redirectURIs.searchConsole.expected
      ],
      steps: [
        '1. https://console.cloud.google.com',
        '2. APIs & Services > Credentials',
        '3. OAuth 2.0 Client ID > Edit',
        '4. Authorized redirect URIs bölümüne yukarıdaki URI\'leri ekleyin',
        '5. SAVE yapın ve 5 dakika bekleyin'
      ]
    },

    debugInfo: {
      timestamp: new Date().toISOString(),
      projectNumber: '770843146139',
      clientIdSuffix: process.env.GOOGLE_CLIENT_ID?.split('-')[0]
    }
  });
}