const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');
const prisma = new PrismaClient();

async function main() {
  console.log('====================================================');
  console.log('🗺️ SITEMAP & SEO SEARCH CONSOLE ANALİZİ');
  console.log('====================================================\n');

  // 1. SITEMAP ANALİZİ & URL SAYILARI
  console.log('📍 1. SITEMAP SAYFA VE URL DAĞILIMI:');
  try {
    const staticCount = 9;
    
    // Bloglar
    const genContent = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as cnt FROM generated_content WHERE status IN ('completed', 'published')`);
    const blogPosts = await prisma.blog_posts.count({ where: { status: 'published' } });
    
    // Hizmetler
    const hizmetler = await prisma.hizmetler.count({ where: { aktif: true } });
    
    // Ürünler
    const urunler = await prisma.urunler.count({ where: { aktif: true } });
    
    // Projeler
    const projeler = await prisma.projeler_gul_tekin.count({ where: { aktif: true } });
    
    // Lokasyonlar (İlçe + Mahalle kombini)
    const lokasyonlar = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::int as cnt
      FROM hizmet_lokasyonlari hl
      LEFT JOIN mahalleler m ON m.ilce_id = hl.id
      WHERE hl.aktif = true AND m.slug IS NOT NULL
    `);

    const totalUrls = staticCount + genContent[0].cnt + hizmetler + urunler + projeler + lokasyonlar[0].cnt;

    console.log(`  • Statik Ana Sayfalar: ${staticCount} URL`);
    console.log(`  • Blog / İçerik Sayfaları: ${genContent[0].cnt} (Ekstra blog_posts: ${blogPosts}) URL`);
    console.log(`  • Hizmet Sayfaları (/hizmetler/[slug]): ${hizmetler} URL`);
    console.log(`  • Ürün Sayfaları (/urunler/[slug]): ${urunler} URL`);
    console.log(`  • Proje Portföy Sayfaları (/projeler/[slug]): ${projeler} URL`);
    console.log(`  • Bölgesel Mahalle Sayfaları (/lokasyonlar/[ilce]/[mahalle]): ${lokasyonlar[0].cnt} URL`);
    console.log(`  👉 Toplam Sitemap URL Sayısı: ~${totalUrls} indexlenebilir sayfa\n`);
  } catch (err) {
    console.error('  ⚠️ Sitemap hesaplanırken hata:', err.message);
  }

  // 2. SEARCH CONSOLE OAUTH TOKEN KONTROLÜ
  console.log('====================================================');
  console.log('🔑 2. GOOGLE SEARCH CONSOLE TOKEN DURUMU:');
  const token = await prisma.google_tokens.findFirst({
    where: { platform: 'search_console' },
    orderBy: { created_at: 'desc' }
  });

  if (token) {
    console.log(`  • Token Kaydı: Mevcut (ID: ${token.id})`);
    console.log(`  • Son Güncelleme: ${token.updated_at || token.created_at}`);
    console.log(`  • Bitiş Tarihi (Expires): ${token.expires_at || 'Bilinmiyor'}`);
  } else {
    console.log('  ⚠️ Kayıtlı Search Console token bulunamadı.');
  }

  // 3. VERİTABANINDAKİ ARAMA SORGULARI & RAPORLAR
  console.log('\n====================================================');
  console.log('🔍 3. VERİTABANINDA SAKLANAN ARAMA & SEO VERİLERİ:');
  
  // Search Results Tablosu (Exa / AI arama kayıtları)
  try {
    const searchRes = await prisma.$queryRawUnsafe(`
      SELECT search_query, COUNT(*)::int as query_count, MAX(created_at) as last_seen
      FROM search_results
      WHERE search_query IS NOT NULL
      GROUP BY search_query
      ORDER BY query_count DESC, last_seen DESC
      LIMIT 15
    `);

    if (searchRes.length > 0) {
      console.log(`\n  🔎 Veritabanındaki Öne Çıkan Arama / Trend Sorguları (${searchRes.length}):`);
      searchRes.forEach((r, idx) => {
        console.log(`  ${idx + 1}. "${r.search_query}" (${r.query_count} arama) [Son: ${r.last_seen ? new Date(r.last_seen).toLocaleDateString('tr-TR') : 'N/A'}]`);
      });
    } else {
      console.log('  ℹ️ search_results tablosunda kayıt bulunamadı.');
    }
  } catch (e) {
    console.log(`  ⚠️ search_results sorgu hatası: ${e.message}`);
  }

  // SEO Performance Tablosu (Search Console senkronizasyon tablosu)
  try {
    const topSeoQueries = await prisma.$queryRawUnsafe(`
      SELECT query, SUM(clicks)::int as total_clicks, SUM(impressions)::int as total_impressions, AVG(ctr)::float as avg_ctr, AVG(position)::float as avg_pos
      FROM seo_performance
      WHERE query IS NOT NULL
      GROUP BY query
      ORDER BY total_clicks DESC, total_impressions DESC
      LIMIT 15
    `);

    if (topSeoQueries.length > 0) {
      console.log(`\n  📈 Google Search Console Kayıtlı Arama Performansı:`);
      topSeoQueries.forEach((q, idx) => {
        console.log(`  ${idx + 1}. "${q.query}" -> Tıklama: ${q.total_clicks} | Gösterim: ${q.total_impressions} | CTR: %${((q.avg_ctr || 0) * 100).toFixed(1)} | Sıra: ${q.avg_pos?.toFixed(1)}`);
      });
    } else {
      console.log('\n  ℹ️ seo_performance tablosunda henüz senkronize edilmiş Search Console sorgu kaydı yok.');
    }
  } catch (e) {
    console.log(`  ⚠️ seo_performance sorgu hatası: ${e.message}`);
  }

  // 4. CANLI SEARCH CONSOLE API DENEMESİ
  console.log('\n====================================================');
  console.log('🌐 4. GOOGLE SEARCH CONSOLE CANLI API BAĞLANTISI:');
  if (token && token.refresh_token && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      });

      const searchconsole = google.searchconsole({
        version: 'v1',
        auth: oauth2Client,
      });

      const sitesRes = await searchconsole.sites.list();
      console.log('  ✅ Search Console API Başarılı! Kayıtlı Siteler:', sitesRes.data.siteEntry?.map(s => s.siteUrl));

      const siteUrl = 'sc-domain:gul-tekinmuhendislik.com';
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28);

      const queryRes = await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: ['query'],
          rowLimit: 20,
        }
      });

      const rows = queryRes.data.rows || [];
      console.log(`\n  🎯 Son 28 Günün En Çok Tıklanan/Gösterilen Canlı Arama Sorguları (${rows.length}):`);
      rows.forEach((r, idx) => {
        console.log(`  ${idx + 1}. "${r.keys[0]}" -> Tıklama: ${r.clicks} | Gösterim: ${r.impressions} | CTR: %${((r.ctr || 0) * 100).toFixed(2)} | Sıra: ${r.position?.toFixed(1)}`);
      });
    } catch (apiErr) {
      console.log(`  ⚠️ Search Console Canlı API Çağrısı: ${apiErr.message}`);
      console.log('  💡 Not: Token süresi dolmuşsa `/api/search-console/auth` üzerinden Google ile giriş yapılarak token yenilenebilir.');
    }
  } else {
    console.log('  ℹ️ Google OAuth istemci bilgileri veya refresh token eksik.');
  }

  await prisma.$disconnect();
  console.log('\n====================================================');
}

main().catch(console.error);
