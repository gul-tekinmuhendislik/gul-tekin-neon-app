import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Token'ı kontrol et
    const tokenResult = await sql`
      SELECT access_token, refresh_token
      FROM google_tokens
      WHERE platform = 'google_business'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const hasToken = tokenResult.length > 0;

    // Google My Business API Yetenekleri
    const capabilities = {
      authentication: {
        status: hasToken ? '✅ Aktif' : '❌ Token Yok',
        token: hasToken ? 'Mevcut' : 'Yetkilendirme gerekli'
      },

      availableActions: {
        posts: {
          title: '📝 Google Posts (Gönderiler)',
          description: 'İşletme profilinizde güncellemeler paylaşın',
          features: [
            '✅ Yeni gönderi oluşturma',
            '✅ Etkinlik duyuruları',
            '✅ Ürün/hizmet tanıtımları',
            '✅ COVID-19 güncellemeleri',
            '✅ Teklifler ve promosyonlar',
            '✅ Call-to-action butonları (Öğren, Rezervasyon, Satın Al, vb.)'
          ],
          limits: 'Haftalık 10 gönderi limiti'
        },

        reviews: {
          title: '⭐ Yorumlar',
          description: 'Müşteri yorumlarını yönetin',
          features: [
            '✅ Yorumları listeleme',
            '✅ Yorumlara yanıt verme',
            '✅ Yorum istatistikleri',
            '❌ Yorum silme (Google tarafından izin verilmez)'
          ]
        },

        insights: {
          title: '📊 İstatistikler',
          description: 'İşletme performans verileri',
          features: [
            '✅ Arama sorguları',
            '✅ Görüntülenme sayıları',
            '✅ Müşteri eylemleri (Arama, Yol tarifi, Web sitesi tıklamaları)',
            '✅ Fotoğraf görüntülenmeleri',
            '✅ Telefon aramaları'
          ]
        },

        locations: {
          title: '📍 Konum Yönetimi',
          description: 'İşletme konumu bilgileri',
          features: [
            '✅ Konum bilgilerini güncelleme',
            '✅ Çalışma saatleri',
            '✅ Özel saatler (tatiller vb.)',
            '✅ İletişim bilgileri',
            '✅ Kategoriler ve özellikler'
          ]
        },

        media: {
          title: '🖼️ Medya',
          description: 'Fotoğraf ve video yönetimi',
          features: [
            '✅ Fotoğraf yükleme',
            '✅ Logo güncelleme',
            '✅ Kapak fotoğrafı',
            '✅ Video yükleme (belirli kategorilerde)',
            '✅ Sanal tur ekleme'
          ]
        },

        questions: {
          title: '❓ Sorular & Cevaplar',
          description: 'Müşteri sorularını yanıtlayın',
          features: [
            '✅ Soruları listeleme',
            '✅ Soruları yanıtlama',
            '✅ En çok sorulan soruları belirleme'
          ]
        }
      },

      apiLimits: {
        'Requests per minute': '60 (Test mode)',
        'Requests per day': '10,000',
        'Posts per week': '10',
        'Photos per day': '10',
        'Review replies per day': '50'
      },

      currentImplementation: {
        database: {
          tables: [
            'google_tokens - Token saklama',
            'google_business_locations - Konum bilgileri',
            'google_business_reviews - Yorumlar',
            'google_business_posts - Gönderiler',
            'google_business_insights - İstatistikler'
          ]
        },
        inngest: {
          functions: [
            'syncGoogleBusinessLocations - Günlük senkronizasyon',
            'Rate limiting: 10 istek/dakika'
          ]
        }
      }
    };

    return NextResponse.json({
      success: true,
      hasActiveToken: hasToken,
      capabilities
    });

  } catch (error) {
    console.error('Error checking capabilities:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check capabilities'
    }, { status: 500 });
  }
}