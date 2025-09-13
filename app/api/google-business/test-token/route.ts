/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { google } from 'googleapis';

export async function GET() {
  try {
    // Token'ı veritabanından al
    const tokenResult = await sql`
      SELECT access_token, refresh_token
      FROM google_tokens
      WHERE platform = 'google_business'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (tokenResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No token found in database'
      }, { status: 404 });
    }

    // OAuth2 client oluştur
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/google/callback'
    );

    // Token'ları set et
    oauth2Client.setCredentials({
      access_token: tokenResult[0].access_token,
      refresh_token: tokenResult[0].refresh_token
    });

    // Google My Business Account Management API'yi kullan
    const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: oauth2Client
    });

    // Hesapları listele
    const accountsResponse = await mybusinessaccountmanagement.accounts.list();

    const accounts = accountsResponse.data.accounts || [];

    // Her hesap için lokasyonları al
    const locationsPromises = accounts.map(async (account) => {
      try {
        const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
          version: 'v1',
          auth: oauth2Client
        });

        const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
          parent: account.name || '',
          pageSize: 100
        });

        return {
          accountName: account.name,
          accountType: account.type,
          locations: locationsResponse.data.locations || []
        };
      } catch (error) {
        console.error(`Error fetching locations for account ${account.name}:`, error);
        return {
          accountName: account.name,
          accountType: account.type,
          locations: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const accountsWithLocations = await Promise.all(locationsPromises);

    return NextResponse.json({
      success: true,
      message: 'Token is valid and working!',
      data: {
        accountsCount: accounts.length,
        accounts: accountsWithLocations,
        totalLocations: accountsWithLocations.reduce((sum, acc) => sum + acc.locations.length, 0)
      }
    });

  } catch (error) {
    console.error('Error testing token:', error);

    // Quota hatası kontrolü
    if ((error as Error)?.message?.includes('Quota exceeded')) {
      return NextResponse.json({
        success: false,
        error: 'API Quota exceeded. Please wait a minute and try again.',
        details: 'Google My Business API has rate limits. In test mode: 60 requests/minute',
        recommendation: 'Add test users in Google Cloud Console OAuth consent screen'
      }, { status: 429 });
    }

    return NextResponse.json({
      success: false,
      error: (error as Error)?.message || 'Failed to test token',
      code: (error as any)?.code,
      status: (error as any)?.status
    }, { status: 500 });
  }
}