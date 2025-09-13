import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Service account key dosyasını kontrol et
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './service-account-key.json';
    const absolutePath = path.resolve(keyPath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({
        success: false,
        error: 'Service account key file not found',
        path: absolutePath
      }, { status: 500 });
    }

    // Key dosyasını oku
    const keyFile = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

    // Auth client oluştur
    const auth = new google.auth.GoogleAuth({
      credentials: keyFile,
      scopes: [
        'https://www.googleapis.com/auth/business.manage',
      ],
    });

    // Client'ı test et
    const authClient = await auth.getClient();
    const projectId = await auth.getProjectId();

    // Google My Business Account Management API'yi test et
    google.options({ auth: authClient });
    const mybusinessaccountmanagement = google.mybusinessaccountmanagement('v1');

    try {
      const response = await mybusinessaccountmanagement.accounts.list();

      return NextResponse.json({
        success: true,
        message: 'Google My Business API connection successful!',
        data: {
          projectId,
          serviceAccountEmail: keyFile.client_email,
          accounts: response.data.accounts || [],
          accountsCount: response.data.accounts?.length || 0
        }
      });
    } catch (apiError: any) {
      // API hatası - muhtemelen hesap erişimi yok
      return NextResponse.json({
        success: false,
        message: 'Authentication successful but no GMB accounts found',
        details: 'Please add the service account email to your Google My Business account',
        serviceAccountEmail: keyFile.client_email,
        error: apiError.message
      }, { status: 403 });
    }

  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test Google My Business API connection'
    }, { status: 500 });
  }
}