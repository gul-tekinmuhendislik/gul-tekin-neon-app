import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basit bir test - sadece service account bilgilerini döndür
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './service-account-key.json';
    const fs = require('fs');
    const path = require('path');

    const absolutePath = path.resolve(keyPath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({
        success: false,
        error: 'Service account key file not found',
        path: absolutePath
      }, { status: 500 });
    }

    const keyFile = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

    return NextResponse.json({
      success: true,
      message: 'Configuration is ready!',
      serviceAccount: {
        email: keyFile.client_email,
        projectId: keyFile.project_id,
        privateKeyId: keyFile.private_key_id,
      },
      instructions: {
        step1: 'Google Cloud Console\'da quota limitini artırın',
        step2: 'Veya 5-10 dakika bekleyin quota sıfırlanana kadar',
        step3: 'Google My Business hesabınızda service account\'un eklendiğinden emin olun',
        googleMyBusinessUrl: 'https://business.google.com',
        quotaUrl: 'https://console.cloud.google.com/apis/api/mybusinessaccountmanagement.googleapis.com/quotas'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Configuration check failed'
    }, { status: 500 });
  }
}