const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
  console.log('====================================================');
  console.log('🔍 GÜL-TEKİN NEON & GOOGLE CLOUD İSTATİSTİK RAPORU');
  console.log('====================================================\n');

  const prisma = new PrismaClient();

  // 1. NEON / PRISMA DATABASE TABLOLARI VE KAYIT SAYILARI (TEK SORGUDA HIZLI)
  console.log('📦 1. VERİTABANI (NEON & PRISMA) DURUMU:');
  try {
    const tableCounts = await prisma.$queryRawUnsafe(`
      SELECT 
        relname AS table_name, 
        n_live_tup AS row_count
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC;
    `);

    console.log(`✅ Toplam Tablo Sayısı: ${tableCounts.length}\n`);
    console.log('--- Tablolar ve Kayıt Sayıları (Canlı İstatistikler) ---');
    for (const item of tableCounts) {
      console.log(`  • ${item.table_name.padEnd(30)}: ${item.row_count} kayıt`);
    }

    console.log('\n--- Önemli Modüller & İçerik Durumu ---');
    const blogCount = await prisma.blog_posts.count();
    const publishedBlogs = await prisma.blog_posts.count({ where: { status: 'published' } });
    console.log(`  📰 Blog Yazıları: Toplam ${blogCount} (Yayında: ${publishedBlogs})`);
    
    const blogs = await prisma.blog_posts.findMany({ 
      select: { title: true, slug: true, status: true, view_count: true, published_at: true },
      take: 5 
    });
    blogs.forEach(b => console.log(`     - [${b.status}] "${b.title}" (${b.view_count || 0} görüntülenme)`));

    const urunCount = await prisma.urunler.count();
    console.log(`  🛍️  Ürünler: Toplam ${urunCount} kayıt`);

    const markaCount = await prisma.markalar.count();
    console.log(`  🏷️  Markalar: Toplam ${markaCount} kayıt`);

    const contactCount = await prisma.contact_messages.count();
    const newContacts = await prisma.contact_messages.count({ where: { status: 'new' } });
    console.log(`  ✉️  İletişim Formu Mesajları: Toplam ${contactCount} (Yeni/Okunmamış: ${newContacts})`);

    const hizmetCount = await prisma.hizmetler.count();
    console.log(`  🔧 Hizmetler: Toplam ${hizmetCount} kayıt`);

    const lokasyonCount = await prisma.hizmet_lokasyonlari.count();
    const mahalleCount = await prisma.mahalleler.count();
    console.log(`  📍 Lokasyonlar: ${lokasyonCount} İlçe, ${mahalleCount} Mahalle`);

  } catch (error) {
    console.error('❌ Veritabanı hatası:', error.message);
  }

  // 2. GOOGLE TOKENS & ENTEGRASYONLAR
  console.log('\n====================================================');
  console.log('🔑 2. GOOGLE TOKENS & HESAPLAR:');
  try {
    const tokens = await prisma.google_tokens.findMany({
      orderBy: { updated_at: 'desc' }
    });
    
    if (tokens.length === 0) {
      console.log('  ⚠️  google_tokens tablosunda henüz kayıtlı token bulunamadı.');
    } else {
      console.log(`  ✅ Kayıtlı Google Token Sayısı: ${tokens.length}`);
      for (const tok of tokens) {
        console.log(`  • Platform: ${tok.platform} | Son Güncelleme: ${tok.updated_at || tok.created_at} | Bitiş (Expires): ${tok.expires_at || 'Süresiz/Otomatik Yenilenir'}`);
      }
    }
  } catch (err) {
    console.log(`  ⚠️ google_tokens tablosu sorgulanamadı: ${err.message}`);
  }

  // 3. GOOGLE SEARCH CONSOLE API TESTİ
  console.log('\n====================================================');
  console.log('📊 3. GOOGLE SEARCH CONSOLE CANLI API ANALİZİ:');
  try {
    const scToken = await prisma.google_tokens.findFirst({
      where: { platform: 'search_console' },
      orderBy: { created_at: 'desc' }
    });

    if (scToken && scToken.access_token && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        access_token: scToken.access_token,
        refresh_token: scToken.refresh_token,
      });

      const searchconsole = google.searchconsole({
        version: 'v1',
        auth: oauth2Client,
      });

      try {
        const sitesRes = await searchconsole.sites.list();
        const sites = sitesRes.data.siteEntry || [];
        console.log(`  ✅ Bağlı Search Console Mülkleri (${sites.length}):`);
        for (const s of sites) {
          console.log(`    - ${s.siteUrl} (Yetki Seviyesi: ${s.permissionLevel})`);
        }

        const siteUrl = 'sc-domain:gul-tekinmuhendislik.com';
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 28);

        const perfRes = await searchconsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dimensions: ['query'],
            rowLimit: 10,
          },
        });

        const rows = perfRes.data.rows || [];
        console.log(`\n  📈 Son 28 Gün Arama Performansı (${siteUrl}):`);
        console.log(`    Toplam Farklı Anahtar Kelime: ${rows.length}`);
        if (rows.length > 0) {
          console.log('\n    En Çok Etkileşim Alan İlk 10 Arama Terimi:');
          rows.forEach((r, idx) => {
            console.log(`    ${idx + 1}. "${r.keys[0]}" -> Tıklama: ${r.clicks} | Gösterim: ${r.impressions} | CTR: %${((r.ctr || 0) * 100).toFixed(2)} | Pozisyon: ${r.position?.toFixed(1)}`);
          });
        }
      } catch (apiErr) {
        console.log(`    ⚠️ Search Console API Hatası: ${apiErr.message}`);
      }
    } else {
      console.log('  ℹ️  Search Console Token veya Google Client ID eksik.');
    }
  } catch (scErr) {
    console.log(`  ⚠️ Search Console kontrolü sırasında hata: ${scErr.message}`);
  }

  // 4. GOOGLE CLOUD / GEMINI & VERTEX AI TESTİ
  console.log('\n====================================================');
  console.log('🤖 4. GOOGLE CLOUD & GEMINI AI DURUMU:');
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('1+1=? Sadece sonucu yaz.');
      const responseText = result.response.text();
      console.log(`  ✅ Gemini 1.5 Flash API Testi: Başarılı (Yanıt: "${responseText.trim()}")`);
    } catch (gErr) {
      console.log(`  ⚠️ Gemini API Hatası: ${gErr.message}`);
    }
  } else {
    console.log('  ℹ️  GEMINI_API_KEY tanımlı değil.');
  }

  // 5. DATABASE SEO PERFORMANS & KAYITLI İSTATİSTİKLER
  console.log('\n====================================================');
  console.log('📊 5. VERİTABANINDA SAKLANAN SEO & ANALİTİK VERİLERİ:');
  try {
    const seoPerfCount = await prisma.seo_performance.count();
    console.log(`  • seo_performance tablosu: ${seoPerfCount} kayıt`);
    if (seoPerfCount > 0) {
      const stats = await prisma.$queryRawUnsafe(`
        SELECT 
          MIN(date) as min_date, 
          MAX(date) as max_date, 
          SUM(clicks)::int as total_clicks, 
          SUM(impressions)::int as total_impressions,
          AVG(ctr)::float as avg_ctr,
          AVG(position)::float as avg_position
        FROM seo_performance
      `);
      if (stats.length > 0) {
        console.log(`    Tarih Aralığı: ${stats[0].min_date} - ${stats[0].max_date}`);
        console.log(`    Toplam Tıklama: ${stats[0].total_clicks} | Toplam Gösterim: ${stats[0].total_impressions}`);
        console.log(`    Ortalama CTR: %${((stats[0].avg_ctr || 0) * 100).toFixed(2)} | Ortalama Pozisyon: ${stats[0].avg_position?.toFixed(1)}`);
      }
    }
  } catch (e) {
    console.log(`  • seo_performance sorgu notu: ${e.message}`);
  }

  try {
    const eventCount = await prisma.event_logs.count();
    console.log(`  • event_logs tablosu: ${eventCount} kayıt`);
  } catch (e) {}

  await prisma.$disconnect();
  console.log('\n====================================================');
  console.log('✨ Tüm kontroller tamamlandı!');
}

main().catch(console.error);
