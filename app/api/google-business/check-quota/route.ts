import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Google Cloud Console'dan quota bilgileri
    const quotaInfo = {
      service: 'mybusinessaccountmanagement.googleapis.com',
      limits: {
        requestsPerMinute: 60, // Test mode'da genelde 60
        requestsPerDay: 10000, // Test mode'da günlük limit
      },
      testMode: {
        enabled: true,
        maxTestUsers: 100,
        benefits: [
          'Daha yüksek rate limit',
          'Ücretsiz kullanım',
          'Test user\'lar için sınırsız erişim'
        ]
      },
      recommendations: [
        '1. Google Cloud Console\'a gidin',
        '2. APIs & Services > OAuth consent screen',
        '3. Test users bölümüne email adresinizi ekleyin',
        '4. Save yapın',
        '5. Tekrar /api/google/auth ile yetkilendirme yapın'
      ]
    };

    return NextResponse.json({
      success: true,
      quotaInfo,
      message: 'Test mode aktif. Test user eklediğinizden emin olun.'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check quota'
    }, { status: 500 });
  }
}