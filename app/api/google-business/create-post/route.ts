/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      summary,
      callToActionType = 'LEARN_MORE',
      callToActionUrl,
      imageUrl,
      topicType = 'STANDARD' // STANDARD, EVENT, OFFER, COVID_19_UPDATE
    } = body;

    // Token'ı al
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
        error: 'No token found. Please authenticate first.'
      }, { status: 401 });
    }

    // OAuth2 client oluştur
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: tokenResult[0].access_token,
      refresh_token: tokenResult[0].refresh_token
    });

    // İlk önce hesapları ve lokasyonları al
    const mybusinessaccountmanagement = google.mybusinessaccountmanagement({
      version: 'v1',
      auth: oauth2Client
    });

    const accountsResponse = await mybusinessaccountmanagement.accounts.list();
    const accounts = accountsResponse.data.accounts || [];

    if (accounts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No Google Business accounts found'
      }, { status: 404 });
    }

    // İlk hesabı kullan
    const account = accounts[0];

    // Lokasyonları al
    const mybusinessbusinessinformation = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: oauth2Client
    });

    if (!account.name) {
      return NextResponse.json({
        success: false,
        error: 'Account name not found for the user.'
      }, { status: 400 });
    }

    const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
      parent: account.name,
      pageSize: 100
    }) as any;

    const locations = locationsResponse.data.locations || [];

    if (locations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No locations found for this account'
      }, { status: 404 });
    }

    // İlk lokasyonu kullan (veya belirtilen lokasyonu)
    const location = locations[0];

    // Post oluştur
    const mybusiness = (google as any).mybusiness({
      version: 'v4',
      auth: oauth2Client
    });

    // Post verisi hazırla
    const postData: Record<string, any> = {
      languageCode: 'tr-TR',
      summary: summary || 'Gül-Tekin Mühendislik\'ten haberler',
      topicType: topicType
    };

    // Başlık ekle
    if (title) {
      postData.event = {
        title: title
      };
    }

    // Call to action ekle
    if (callToActionUrl) {
      postData.callToAction = {
        actionType: callToActionType,
        url: callToActionUrl
      };
    }

    // Resim ekle
    if (imageUrl) {
      postData.media = [{
        mediaFormat: 'PHOTO',
        sourceUrl: imageUrl
      }];
    }

    // Post'u oluştur
    const createPostResponse = await mybusiness.accounts.locations.localPosts.create({
      parent: location.name,
      requestBody: postData
    });

    // Post'u veritabanına kaydet
    await sql`
      INSERT INTO google_business_posts (
        post_id,
        location_id,
        title,
        summary,
        call_to_action_type,
        call_to_action_url,
        topic_type,
        language_code,
        state,
        metadata
      ) VALUES (
        ${createPostResponse.data.name || ''},
        ${location.name},
        ${title || ''},
        ${summary || ''},
        ${callToActionType},
        ${callToActionUrl || null},
        ${topicType},
        'tr-TR',
        ${createPostResponse.data.state || 'LIVE'},
        ${JSON.stringify(createPostResponse.data)}
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Post created successfully!',
      post: {
        id: createPostResponse.data.name,
        state: createPostResponse.data.state,
        searchUrl: createPostResponse.data.searchUrl,
        createTime: createPostResponse.data.createTime,
        updateTime: createPostResponse.data.updateTime
      },
      location: {
        name: location.name,
        title: location.title
      }
    });

  } catch (error) {
    console.error('Error creating post:', error);

    // Quota hatası kontrolü
    if ((error as Error)?.message?.includes('Quota exceeded')) {
      return NextResponse.json({
        success: false,
        error: 'API Quota exceeded. Please wait and try again.',
        details: 'Maximum 10 posts per week allowed'
      }, { status: 429 });
    }

    return NextResponse.json({
      success: false,
      error: (error as Error)?.message || 'Failed to create post',
      details: (error as any)?.response?.data || null
    }, { status: 500 });
  }
}

// Örnek post verilerini göster
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Google Business Post API',
    example: {
      method: 'POST',
      body: {
        title: 'Güneş Enerjisi Sistemleri Kampanyası',
        summary: 'Bodrum ve çevresinde güneş enerjisi sistemleri kurulumu için özel indirimlerimizden yararlanın! Profesyonel ekibimizle enerji tasarrufu sağlayın.',
        callToActionType: 'LEARN_MORE', // BOOK, ORDER, SHOP, SIGN_UP, CALL
        callToActionUrl: 'https://gul-tekinmuhendislik.com/hizmetler/gunes-enerjisi',
        imageUrl: 'https://example.com/solar-panel.jpg',
        topicType: 'OFFER' // STANDARD, EVENT, OFFER, COVID_19_UPDATE
      }
    },
    callToActionTypes: [
      'BOOK - Rezervasyon yap',
      'ORDER - Sipariş ver',
      'LEARN_MORE - Daha fazla bilgi',
      'SHOP - Alışveriş yap',
      'SIGN_UP - Kaydol',
      'CALL - Ara'
    ],
    topicTypes: [
      'STANDARD - Standart gönderi',
      'EVENT - Etkinlik duyurusu',
      'OFFER - Teklif/Kampanya',
      'COVID_19_UPDATE - COVID-19 güncellemesi'
    ]
  });
}