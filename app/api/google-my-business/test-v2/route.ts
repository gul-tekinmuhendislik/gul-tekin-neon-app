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

    // Service account ile JWT token oluştur
    const jwtClient = new google.auth.JWT({
      email: keyFile.client_email,
      key: keyFile.private_key,
      scopes: ['https://www.googleapis.com/auth/business.manage'],
    });

    try {
      // Authorize et
      await jwtClient.authorize();

      return NextResponse.json({
        success: true,
        message: 'Authentication successful!',
        serviceAccountEmail: keyFile.client_email,
        projectId: keyFile.project_id,
        note: 'Please ensure this email is added to your Google My Business account with Owner or Manager role',
        nextSteps: [
          '1. Go to https://business.google.com',
          '2. Select your business',
          '3. Go to Users section',
          `4. Add ${keyFile.client_email} as a user`,
          '5. Give Owner or Manager role'
        ]
      });
    } catch (authError: any) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        details: authError.message
      }, { status: 401 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test authentication'
    }, { status: 500 });
  }
}