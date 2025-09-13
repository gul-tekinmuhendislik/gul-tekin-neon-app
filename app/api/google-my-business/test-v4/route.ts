import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './service-account-key.json';
    const absolutePath = path.resolve(keyPath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({
        success: false,
        error: 'Service account key file not found',
        path: absolutePath
      }, { status: 500 });
    }

    const keyFile = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

    // Auth client oluştur
    const auth = new google.auth.GoogleAuth({
      credentials: keyFile,
      scopes: [
        'https://www.googleapis.com/auth/business.manage',
      ],
    });

    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    // My Business API v4 kullan
    const mybusiness = google.mybusiness('v4');

    try {
      // Önce hesapları listele
      const accountsResponse = await mybusiness.accounts.list({
        pageSize: 20,
      });

      if (!accountsResponse.data.accounts || accountsResponse.data.accounts.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No Google My Business accounts found',
          serviceAccountEmail: keyFile.client_email,
          note: 'Please make sure the service account has been added to your GMB account'
        }, { status: 404 });
      }

      // İlk hesabı al
      const account = accountsResponse.data.accounts[0];

      // Bu hesaba ait lokasyonları listele
      const locationsResponse = await mybusiness.accounts.locations.list({
        parent: account.name!,
        pageSize: 20,
      });

      return NextResponse.json({
        success: true,
        message: 'Google My Business connection successful!',
        data: {
          account: {
            name: account.name,
            accountName: account.accountName,
            type: account.type,
          },
          locations: locationsResponse.data.locations || [],
          locationsCount: locationsResponse.data.locations?.length || 0,
          serviceAccountEmail: keyFile.client_email,
        }
      });

    } catch (apiError: any) {
      // API hatası detaylarını döndür
      return NextResponse.json({
        success: false,
        message: 'API call failed',
        error: apiError.message,
        code: apiError.code,
        statusCode: apiError.response?.status,
        details: apiError.response?.data,
        serviceAccountEmail: keyFile.client_email,
      }, { status: apiError.response?.status || 500 });
    }

  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test Google My Business API connection'
    }, { status: 500 });
  }
}