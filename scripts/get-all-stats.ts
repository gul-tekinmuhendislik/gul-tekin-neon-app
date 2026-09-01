import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  console.log('====================================================');
  console.log('🔍 GÜL-TEKİN NEON & GOOGLE CLOUD İSTATİSTİK RAPORU');
  console.log('====================================================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL bulunamadı (.env.local kontrol edin)');
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  const prisma = new PrismaClient();

  // 1. NEON / PRISMA DATABASE ANALİZİ
  console.log('📦 1. VERİTABANI (NEON & PRISMA) DURUMU:');
  try {
    const tableList = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename ASC
    `;

    console.log(`✅ Toplam Tablo Sayısı: ${tableList.length}`);
    console.log('\n--- Tablo Kayıt Sayıları ---');
    
    const tableCounts: { table: string; count: number }[] = [];
    for (const t of tableList) {
      try {
        const countRes = await sql(`SELECT COUNT(*)::int as cnt FROM "${t.tablename}"`);
        tableCounts.push({ table: t.tablename, count: countRes[0].cnt });
      } catch (err: any) {
        tableCounts.push({ table: t.tablename, count: -1 });
      }
    }

    // Sort by count desc
    tableCounts.sort((a, b) => b.count - a.count);
    for (const item of tableCounts) {
      console.log(`  • ${item.table.padEnd(30)}: ${item.count >= 0 ? item.count + ' kayıt' : 'Erişim Hatası'}`);
    }

    // Prisma spesifik kontroller
    console.log('\n--- Önemli Veritabanı Varlıkları ---');
    try {
      const blogCount = await prisma.blog_posts.count();
      const publishedBlogs = await prisma.blog_posts.count({ where: { status: 'published' } });
      console.log(`  📰 Blog Yazıları: Toplam ${blogCount} (Yayında: ${publishedBlogs})`);
    } catch (e: any) {
      console.log(`  📰 Blog Yazıları: ${e.message}`);
    }

    try {
      const contactCount = await prisma.contact_messages.count();
      const newContacts = await prisma.contact_messages.count({ where: { status: 'new' } });
      console.log(`  ✉️  İletişim Mesajları: Toplam ${contactCount} (Yeni: ${newContacts})`);
    } catch (e: any) {
      console.log(`  ✉️  İletişim Mesajları: ${e.message}`);
    }

    try {
      const searchResCount = await sql`SELECT COUNT(*)::int as cnt FROM search_results`;
      console.log(`  🔎 Search Results (Arama Sonuçları): ${searchResCount[0].cnt} kayıt`);
    } catch (e) {}

    try {
      const promptCount = await sql`SELECT COUNT(*)::int as cnt FROM vertex_prompts`;
      console.log(`  🎨 Vertex AI Promptları: ${promptCount[0].cnt} kayıt`);
    } catch (e) {}

  } catch (error: any) {
    console.error('❌ Veritabanı sorgu hatası:', error.message);
  }

  // 2. GOOGLE TOKENS & SEARCH CONSOLE / GMB KONTROLÜ
  console.log('\n====================================================');
  console.log('🔑 2. GOOGLE TOKENS & ENTEGRASYONLAR:');
  try {
    const tokens = await sql`
      SELECT id, platform, scope, created_at, updated_at 
      FROM google_tokens 
      ORDER BY updated_at DESC
    `;
    
    if (tokens.length === 0) {
      console.log('  ⚠️  google_tokens tablosunda henüz kayıtlı token bulunamadı.');
    } else {
      console.log(`  ✅ Kayıtlı Google Token Sayısı: ${tokens.length}`);
      for (const tok of tokens) {
        console.log(`  • Platform: ${tok.platform} | Güncellenme: ${tok.updated_at || tok.created_at} | Scope: ${tok.scope ? tok.scope.substring(0, 40) + '...' : 'N/A'}`);
      }
    }
  } catch (err: any) {
    console.log(`  ⚠️  google_tokens tablosu sorgulanamadı: ${err.message}`);
  }

  // 3. GOOGLE SEARCH CONSOLE API TESTİ
  console.log('\n====================================================');
  console.log('📊 3. GOOGLE SEARCH CONSOLE ANALİZİ:');
  try {
    const scTokens = await sql`
      SELECT access_token, refresh_token 
      FROM google_tokens 
      WHERE platform = 'search_console' 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (scTokens.length > 0 && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({
        access_token: scTokens[0].access_token,
        refresh_token: scTokens[0].refresh_token,
      });

      const searchconsole = google.searchconsole({
        version: 'v1',
        auth: oauth2Client,
      });

      const sitesRes = await searchconsole.sites.list();
      const sites = sitesRes.data.siteEntry || [];
      console.log(`  ✅ Bağlı Search Console Siteleri (${sites.length}):`);
      for (const s of sites) {
        console.log(`    - ${s.siteUrl} (${s.permissionLevel})`);
      }

      // Son 28 gün performans sorgusu
      const siteUrl = 'sc-domain:gul-tekinmuhendislik.com';
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28);

      try {
        const perfRes = await searchconsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dimensions: ['query'],
            rowLimit: 5,
          },
        });

        const rows = perfRes.data.rows || [];
        console.log(`\n  📈 Son 28 Gün Arama Performansı (${siteUrl}):`);
        console.log(`    Toplam Sorgu Sayısı: ${rows.length}`);
        if (rows.length > 0) {
          console.log('    En Çok Tıklanan/Gösterilen İlk 5 Arama Terimi:');
          for (const r of rows) {
            console.log(`    • "${r.keys?.[0]}" -> Tıklama: ${r.clicks}, Gösterim: ${r.impressions}, CTR: %${((r.ctr || 0) * 100).toFixed(2)}, Pozisyon: ${r.position?.toFixed(1)}`);
          }
        }
      } catch (perfErr: any) {
        console.log(`    ⚠️ Performans verisi çekilirken: ${perfErr.message}`);
      }
    } else {
      console.log('  ℹ️  Search Console Token veya Google OAuth ENV eksik/tanımlanmamış.');
      if (!process.env.GOOGLE_CLIENT_ID) console.log('    - GOOGLE_CLIENT_ID eksik');
      if (scTokens.length === 0) console.log('    - google_tokens tablosunda search_console tokenı yok');
    }
  } catch (scErr: any) {
    console.log(`  ⚠️ Search Console kontrolü sırasında hata: ${scErr.message}`);
  }

  // 4. GEMINI & VERTEX AI / GOOGLE CLOUD DURUMU
  console.log('\n====================================================');
  console.log('🤖 4. GOOGLE CLOUD / GEMINI AI DURUMU:');
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    try {
      const genAI = new GoogleGenerativeAI(apiKey!);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('ping');
      const responseText = result.response.text();
      console.log(`  ✅ Gemini API Bağlantısı Başarılı (Yanıt alındı: ${responseText.trim().substring(0, 30)})`);
    } catch (gErr: any) {
      console.log(`  ⚠️ Gemini API Hatası: ${gErr.message}`);
    }
  } else {
    console.log('  ℹ️  GEMINI_API_KEY ortam değişkeni bulunamadı.');
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CREDENTIALS_BASE64) {
    console.log('  ✅ Google Cloud Service Account kimlik bilgisi mevcut.');
  }

  await prisma.$disconnect();
  console.log('\n====================================================');
  console.log('✨ Analiz tamamlandı.');
}

main().catch(console.error);
