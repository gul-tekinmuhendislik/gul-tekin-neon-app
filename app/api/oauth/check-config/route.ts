import { NextResponse } from 'next/server';

export async function GET() {
  const isDev = process.env.NODE_ENV === 'development';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Gerçek redirect URI'leri hesapla
  const actualRedirectURIs = {
    googleBusiness: isDev
      ? 'http://localhost:3000/api/google/callback'
      : `${siteUrl}/api/google/callback`,
    searchConsole: isDev
      ? 'http://localhost:3000/api/search-console/callback'
      : `${siteUrl}/api/search-console/callback`
  };

  // Google Cloud Console'a eklenmesi gereken URI'ler
  const requiredURIs = [
    // Development
    'http://localhost:3000/api/google/callback',
    'http://localhost:3000/api/search-console/callback',

    // Production (ai.gul-tekinmuhendislik.com)
    'https://ai.gul-tekinmuhendislik.com/api/google/callback',
    'https://ai.gul-tekinmuhendislik.com/api/search-console/callback',

    // Production (gul-tekinmuhendislik.com) - ana domain için
    'https://gul-tekinmuhendislik.com/api/google/callback',
    'https://gul-tekinmuhendislik.com/api/search-console/callback'
  ];

  const currentConfig = {
    environment: isDev ? 'Development' : 'Production',
    nodeEnv: process.env.NODE_ENV,
    siteUrl: siteUrl,
    actualURIsInUse: actualRedirectURIs,
    clientId: process.env.GOOGLE_CLIENT_ID,
    projectNumber: '770843146139'
  };

  return NextResponse.json({
    success: true,
    message: '⚠️ Google Cloud Console\'da TÜM bu URI\'leri eklemeniz gerekiyor!',

    currentConfig,

    requiredSteps: [
      '1. https://console.cloud.google.com adresine gidin',
      '2. Projenizi seçin (Project Number: 770843146139)',
      '3. APIs & Services > Credentials',
      '4. OAuth 2.0 Client ID\'yi düzenleyin',
      '5. "Authorized redirect URIs" bölümüne aşağıdaki TÜM URI\'leri ekleyin:',
    ],

    copyPasteURIs: requiredURIs,

    importantNotes: [
      '🔴 TÜM URI\'leri eklemeniz önemli (hem localhost hem production)',
      '🔴 Her URI\'yi ayrı satır olarak ekleyin',
      '🔴 Kopyala-yapıştır yaparken boşluk bırakmayın',
      '🔴 Save yaptıktan sonra 5 dakika bekleyin',
      '🔴 Şu anda kullanılan: ' + (isDev ? 'http://localhost:3000' : siteUrl)
    ],

    debugInfo: {
      currentlyUsing: isDev
        ? 'http://localhost:3000/api/google/callback'
        : `${siteUrl}/api/google/callback`,
      expectedByGoogle: 'Google Cloud Console\'da yukarıdaki URI\'lerden biri olmalı'
    }
  });
}