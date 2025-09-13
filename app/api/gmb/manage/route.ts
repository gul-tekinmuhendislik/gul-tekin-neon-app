/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { google } from 'googleapis';

// OAuth2 client oluştur
function createOAuth2Client(accessToken?: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/google/callback'
  );

  if (accessToken && refreshToken) {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }

  return oauth2Client;
}

// Token'ı veritabanından al
async function getTokenFromDB() {
  const result = await sql`
    SELECT access_token, refresh_token
    FROM google_tokens
    WHERE platform = 'google_business'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (result.length === 0) {
    throw new Error('No token found. Please authenticate first.');
  }

  return result[0];
}

// GET - İşletme bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'info';

    const token = await getTokenFromDB();
    const oauth2Client = createOAuth2Client(token.access_token, token.refresh_token);

    // Account Management API
    const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: oauth2Client
    });

    // Business Information API
    const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: oauth2Client
    });

    // Hesapları al
    const accountsResponse = await mybusinessaccountmanagement.accounts.list();
    const accounts = accountsResponse.data.accounts || [];

    if (accounts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No Google Business accounts found'
      });
    }

    const account = accounts[0];

    switch (action) {
      case 'info': {
        // İşletme bilgilerini getir
        const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
          parent: account.name || '',
          pageSize: 100,
          readMask: 'name,title,storefrontAddress,websiteUri,regularHours,specialHours,phoneNumbers,categories,labels,metadata'
        });

        const locations = locationsResponse.data.locations || [];

        return NextResponse.json({
          success: true,
          account: {
            name: account.name,
            accountName: account.accountName,
            type: account.type
          },
          locations: locations.map(loc => ({
            name: loc.name,
            title: loc.title,
            address: loc.storefrontAddress,
            website: loc.websiteUri,
            phone: loc.phoneNumbers,
            hours: loc.regularHours,
            categories: loc.categories
          })),
          totalLocations: locations.length
        });
      }

      case 'reviews': {
        // Yorumları getir
        const mybusinessreviews = (google as any).mybusiness({ version: 'v4', auth: oauth2Client });

        const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
          parent: account.name || '',
          pageSize: 1
        });

        const location = locationsResponse.data.locations?.[0];
        if (!location) {
          return NextResponse.json({ success: false, error: 'No location found' });
        }

        const reviewsResponse = await mybusinessreviews.accounts.locations.reviews.list({
          parent: location.name?.replace('locations/', 'accounts/') + '/locations/' + location.name?.split('/').pop(),
          pageSize: 50
        });

        const reviews = reviewsResponse.data.reviews || [];

        // Veritabanına kaydet
        for (const review of reviews) {
          await sql`
            INSERT INTO google_business_reviews (
              review_id, location_id, reviewer_name, rating, comment, review_time
            ) VALUES (
              ${review.reviewId || ''}, ${location.name || ''},
              ${review.reviewer?.displayName || 'Anonymous'},
              ${review.starRating || 0}, ${review.comment || ''},
              ${review.createTime || null}
            )
            ON CONFLICT (review_id) DO UPDATE SET
              rating = EXCLUDED.rating,
              comment = EXCLUDED.comment,
              updated_at = NOW()
          `;
        }

        return NextResponse.json({
          success: true,
          location: location.title,
          reviewsCount: reviews.length,
          averageRating: reviews.reduce((sum: number, r: any) => sum + (r.starRating || 0), 0) / reviews.length || 0,
          reviews: reviews.slice(0, 5).map((r: any) => ({
            reviewer: r.reviewer?.displayName,
            rating: r.starRating,
            comment: r.comment,
            time: r.createTime,
            reply: r.reviewReply?.comment
          }))
        });
      }

      case 'insights': {
        // İstatistikleri getir (Not: Bu API'nin ayrı erişim izni gerekebilir)
        return NextResponse.json({
          success: true,
          message: 'Insights API requires additional setup',
          info: 'Google My Business Insights API is being deprecated. Use Performance API instead.'
        });
      }

      case 'posts': {
        // Gönderileri listele
        const mybusiness = (google as any).mybusiness({ version: 'v4', auth: oauth2Client });

        const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
          parent: account.name || '',
          pageSize: 1
        });

        const location = locationsResponse.data.locations?.[0];
        if (!location) {
          return NextResponse.json({ success: false, error: 'No location found' });
        }

        const postsResponse = await mybusiness.accounts.locations.localPosts.list({
          parent: location.name?.replace('locations/', 'accounts/') + '/locations/' + location.name?.split('/').pop(),
          pageSize: 10
        });

        const posts = postsResponse.data.localPosts || [];

        return NextResponse.json({
          success: true,
          location: location.title,
          postsCount: posts.length,
          posts: posts.map((post: any) => ({
            name: post.name,
            summary: post.summary,
            state: post.state,
            createTime: post.createTime,
            updateTime: post.updateTime,
            callToAction: post.callToAction,
            media: post.media
          }))
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: info, reviews, insights, or posts'
        });
    }

  } catch (error) {
    console.error('GMB Management Error:', error);

    if ((error as Error)?.message?.includes('Quota exceeded')) {
      return NextResponse.json({
        success: false,
        error: 'API Quota exceeded. Please wait a minute.',
        retryAfter: '60 seconds'
      }, { status: 429 });
    }

    return NextResponse.json({
      success: false,
      error: (error as Error)?.message || 'Failed to manage GMB',
      details: (error as any)?.response?.data
    }, { status: 500 });
  }
}

// POST - İşletme bilgilerini güncelle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const token = await getTokenFromDB();
    const oauth2Client = createOAuth2Client(token.access_token, token.refresh_token);

    const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: oauth2Client
    });

    const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: oauth2Client
    });

    // Hesap ve lokasyon bilgilerini al
    const accountsResponse = await mybusinessaccountmanagement.accounts.list();
    const account = accountsResponse.data.accounts?.[0];

    if (!account) {
      return NextResponse.json({ success: false, error: 'No account found' });
    }

    const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
      parent: account.name || '',
      pageSize: 1
    });

    const location = locationsResponse.data.locations?.[0];

    if (!location) {
      return NextResponse.json({ success: false, error: 'No location found' });
    }

    switch (action) {
      case 'update_hours': {
        // Çalışma saatlerini güncelle
        const { regularHours } = data;

        const updateResponse = await (mybusinessbusinessinformation.accounts.locations as any).patch({
          name: location.name,
          updateMask: 'regularHours',
          requestBody: {
            regularHours: regularHours
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Business hours updated successfully',
          data: updateResponse.data
        });
      }

      case 'update_info': {
        // İşletme bilgilerini güncelle
        const { title, phoneNumbers, websiteUri, description } = data;

        const updateMask = [];
        const updateData: Record<string, any> = {};

        if (title) {
          updateMask.push('title');
          updateData.title = title;
        }
        if (phoneNumbers) {
          updateMask.push('phoneNumbers');
          updateData.phoneNumbers = phoneNumbers;
        }
        if (websiteUri) {
          updateMask.push('websiteUri');
          updateData.websiteUri = websiteUri;
        }
        if (description) {
          updateMask.push('profile.description');
          updateData.profile = { description };
        }

        const updateResponse = await (mybusinessbusinessinformation.accounts.locations as any).patch({
          name: location.name,
          updateMask: updateMask.join(','),
          requestBody: updateData
        });

        return NextResponse.json({
          success: true,
          message: 'Business info updated successfully',
          data: updateResponse.data
        });
      }

      case 'reply_review': {
        // Yoruma yanıt ver
        const { reviewId, reply } = data;
        const mybusiness = (google as any).mybusiness({ version: 'v4', auth: oauth2Client });

        const replyResponse = await mybusiness.accounts.locations.reviews.updateReply({
          name: `${location.name}/reviews/${reviewId}`,
          requestBody: {
            comment: reply
          }
        });

        // Veritabanını güncelle
        await sql`
          UPDATE google_business_reviews
          SET reply_comment = ${reply}, reply_time = NOW()
          WHERE review_id = ${reviewId}
        `;

        return NextResponse.json({
          success: true,
          message: 'Review reply posted successfully',
          data: replyResponse.data
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: update_hours, update_info, or reply_review'
        });
    }

  } catch (error) {
    console.error('GMB Update Error:', error);

    return NextResponse.json({
      success: false,
      error: (error as Error)?.message || 'Failed to update GMB',
      details: (error as any)?.response?.data
    }, { status: 500 });
  }
}