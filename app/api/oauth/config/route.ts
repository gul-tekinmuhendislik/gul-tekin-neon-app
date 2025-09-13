import { NextResponse } from 'next/server';

export async function GET() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = isDevelopment ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_SITE_URL;

  const redirectURIs = {
    googleBusiness: {
      auth: `${baseUrl}/api/google/callback`,
      description: 'Google My Business API'
    },
    searchConsole: {
      auth: `${baseUrl}/api/search-console/callback`,
      description: 'Google Search Console API'
    },
    googleAnalytics: {
      auth: `${baseUrl}/api/analytics/callback`,
      description: 'Google Analytics API'
    },
    googleAds: {
      auth: `${baseUrl}/api/ads/callback`,
      description: 'Google Ads API'
    },
    youtube: {
      auth: `${baseUrl}/api/youtube/callback`,
      description: 'YouTube Data API'
    },
    drive: {
      auth: `${baseUrl}/api/drive/callback`,
      description: 'Google Drive API'
    }
  };

  const instructions = {
    title: '🔧 Google Cloud Console Redirect URI Ayarları',

    steps: [
      '1. Google Cloud Console\'a gidin: https://console.cloud.google.com',
      '2. Projenizi seçin (Project ID: 770843146139)',
      '3. APIs & Services > Credentials menüsüne gidin',
      '4. OAuth 2.0 Client ID\'nizi bulun ve düzenle butonuna tıklayın',
      '5. "Authorized redirect URIs" bölümüne aşağıdaki URI\'leri ekleyin:',
    ],

    requiredURIs: Object.entries(redirectURIs).map(([key, value]) => ({
      service: key,
      uri: value.auth,
      description: value.description,
      required: ['googleBusiness', 'searchConsole'].includes(key)
    })),

    currentSettings: {
      environment: isDevelopment ? 'Development' : 'Production',
      baseUrl: baseUrl,
      clientId: process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET
    },

    importantNotes: [
      '⚠️ URI\'ler tam olarak eşleşmeli (trailing slash dahil)',
      '⚠️ http/https protokolüne dikkat edin',
      '⚠️ Port numarası önemli (localhost:3000)',
      '⚠️ Her değişiklikten sonra "Save" yapmayı unutmayın',
      '⚠️ Değişikliklerin aktif olması 5 dakika sürebilir'
    ],

    troubleshooting: {
      'redirect_uri_mismatch': [
        'Console\'daki URI ile koddaki URI tam eşleşmiyor',
        'Protokol farkı var (http vs https)',
        'Port numarası eksik veya yanlış',
        'Trailing slash sorunu'
      ],
      'invalid_client': [
        'Client ID yanlış',
        'Client Secret yanlış',
        'OAuth client devre dışı'
      ],
      'access_denied': [
        'Kullanıcı izin vermedi',
        'Scope\'lar yanlış',
        'Test user eklenmemiş (test mode\'da)'
      ]
    }
  };

  return NextResponse.json({
    success: true,
    redirectURIs,
    instructions,
    message: 'Copy these URIs to Google Cloud Console OAuth settings'
  });
}