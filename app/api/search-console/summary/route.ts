import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Token kontrolü
    const tokenCheck = await sql`
      SELECT
        EXISTS(
          SELECT 1 FROM google_tokens
          WHERE platform = 'search_console'
          AND expires_at > NOW()
        ) as has_valid_token
    `;

    const hasValidToken = tokenCheck[0]?.has_valid_token || false;

    // SEO özet istatistikleri
    const summary = {
      authentication: {
        status: hasValidToken ? '✅ Bağlı' : '❌ Bağlantı Yok',
        message: hasValidToken
          ? 'Search Console bağlantısı aktif'
          : 'Yetkilendirme gerekli: /api/search-console/auth',
        authUrl: !hasValidToken ? '/api/search-console/auth' : null
      },

      features: {
        '📊 Performans Takibi': {
          description: 'Arama sonuçlarındaki performansınızı izleyin',
          metrics: [
            'Tıklama sayısı',
            'Gösterim sayısı',
            'Ortalama CTR (Tıklama oranı)',
            'Ortalama pozisyon'
          ],
          endpoint: '/api/search-console/analytics?action=performance'
        },

        '🔍 Anahtar Kelime Analizi': {
          description: 'Hangi aramalardan trafik aldığınızı görün',
          features: [
            'En çok tıklanan aramalar',
            'Yüksek gösterim düşük tıklama',
            'Pozisyon değişimleri',
            'Fırsat kelimeleri'
          ],
          endpoint: '/api/search-console/analytics?action=performance'
        },

        '📱 Mobil Kullanılabilirlik': {
          description: 'Mobil performansınızı takip edin',
          checks: [
            'Mobil dostu sayfalar',
            'Viewport yapılandırması',
            'Dokunma hedefleri',
            'Okunabilir içerik boyutu'
          ],
          endpoint: '/api/search-console/analytics?action=mobile'
        },

        '🗺️ Sitemap Yönetimi': {
          description: 'XML sitemap durumunu kontrol edin',
          features: [
            'Sitemap gönderimi',
            'İndekslenen URL sayısı',
            'Hata ve uyarılar',
            'Son tarama tarihi'
          ],
          endpoint: '/api/search-console/analytics?action=sitemaps'
        },

        '⚡ Core Web Vitals': {
          description: 'Sayfa deneyimi metriklerini izleyin',
          metrics: [
            'LCP (Largest Contentful Paint)',
            'FID (First Input Delay)',
            'CLS (Cumulative Layout Shift)',
            'INP (Interaction to Next Paint)'
          ],
          importance: 'Google sıralama faktörü'
        },

        '🔗 İndeksleme Durumu': {
          description: 'Sayfalarınızın indeks durumunu kontrol edin',
          features: [
            'İndekslenen sayfalar',
            'Kapsam hataları',
            'Geçerli sayfalar',
            'URL inceleme'
          ],
          endpoint: '/api/search-console/analytics?action=indexing'
        },

        '🐛 Hata Takibi': {
          description: 'SEO hatalarını tespit edin ve düzeltin',
          errorTypes: [
            '404 sayfalar',
            'Sunucu hataları (5xx)',
            'Yönlendirme hataları',
            'Robots.txt engelleri',
            'Canonical sorunları'
          ]
        },

        '📈 Rakip Analizi': {
          description: 'Rakiplerinizle karşılaştırma',
          metrics: [
            'Ortalama pozisyon farkı',
            'Paylaşılan anahtar kelimeler',
            'İçerik boşlukları',
            'Backlink karşılaştırması'
          ],
          note: 'Ek araçlar gerektirir'
        }
      },

      benefits: {
        'SEO Optimizasyonu': [
          '✅ Hangi sayfalar daha iyi performans gösteriyor',
          '✅ Hangi anahtar kelimeler trafik getiriyor',
          '✅ Teknik SEO sorunlarını tespit etme',
          '✅ İçerik stratejisi geliştirme'
        ],

        'Performans İzleme': [
          '✅ Organik trafik trendleri',
          '✅ CTR optimizasyonu',
          '✅ Sayfa hızı iyileştirmeleri',
          '✅ Mobil deneyim takibi'
        ],

        'Hata Yönetimi': [
          '✅ 404 hataları bulma',
          '✅ İndeksleme sorunları',
          '✅ Güvenlik sorunları',
          '✅ Structured data hataları'
        ]
      },

      quickActions: {
        authenticate: {
          title: 'Search Console Bağla',
          url: '/api/search-console/auth',
          method: 'GET',
          description: 'Google hesabınızla yetkilendirme yapın'
        },

        checkPerformance: {
          title: 'Performans Raporu',
          url: '/api/search-console/analytics?action=performance',
          method: 'GET',
          description: 'Son 28 günlük performans verilerini görün'
        },

        submitSitemap: {
          title: 'Sitemap Gönder',
          url: '/api/search-console/analytics',
          method: 'POST',
          body: {
            action: 'submit_sitemap',
            siteUrl: 'https://gul-tekinmuhendislik.com',
            data: {
              sitemapUrl: 'https://gul-tekinmuhendislik.com/sitemap.xml'
            }
          }
        },

        requestIndexing: {
          title: 'URL İndeksleme İste',
          url: '/api/search-console/analytics',
          method: 'POST',
          body: {
            action: 'request_indexing',
            data: {
              url: 'https://gul-tekinmuhendislik.com/new-page'
            }
          }
        }
      },

      statistics: {
        apiStatus: hasValidToken ? 'Aktif' : 'Bağlantı Yok',
        tablesCreated: 6,
        features: 8,
        endpoints: 5
      }
    };

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Error getting SEO summary:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get SEO summary'
    }, { status: 500 });
  }
}