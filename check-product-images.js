#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('Urun Resimleri - Neon DB Analizi');
console.log('='.repeat(60) + '\n');

(async () => {
  try {
    await client.connect();
    console.log('[OK] Neon Database baglantisi kuruldu\n');

    // 1. URUNLER tablosu yapısı
    console.log('Tablo Yapisi (Resim Alanlari):\n');
    const schema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'urunler'
      AND (column_name LIKE '%resim%' OR column_name LIKE '%gorsel%' OR column_name LIKE '%cloud%' OR column_name LIKE '%url%')
      ORDER BY ordinal_position
    `);

    console.log('  Resim Iliskili Sutunlar:');
    schema.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
      console.log(`  * ${row.column_name}: ${row.data_type} ${nullable}`);
    });

    // 2. Total ürün sayısı
    console.log('\n\nUrun Istatistikleri:\n');
    const totalRes = await client.query('SELECT COUNT(*) as cnt FROM urunler');
    const totalCount = totalRes.rows[0].cnt;
    console.log(`  Total urun: ${totalCount}`);

    // 3. Resim coverage
    console.log('\n  Resim Coverage:\n');

    const gorselRes = await client.query(`
      SELECT 
        COUNT(*) as cnt,
        COUNT(CASE WHEN gorsel_url IS NOT NULL THEN 1 END) as with_gorsel,
        COUNT(CASE WHEN cloudinary_url IS NOT NULL THEN 1 END) as with_cloudinary,
        COUNT(CASE WHEN cloudinary_url IS NULL AND gorsel_url IS NULL THEN 1 END) as no_image
      FROM urunler
    `);

    const stats = gorselRes.rows[0];
    console.log(`  * Toplam Urun: ${stats.cnt}`);
    console.log(`  * gorsel_url var: ${stats.with_gorsel} (${(stats.with_gorsel/stats.cnt*100).toFixed(1)}%)`);
    console.log(`  * cloudinary_url var: ${stats.with_cloudinary} (${(stats.with_cloudinary/stats.cnt*100).toFixed(1)}%)`);
    console.log(`  * Resim yok: ${stats.no_image} (${(stats.no_image/stats.cnt*100).toFixed(1)}%)`);

    // 4. URL tiplerine göre dağılım
    console.log('\n\nResim URL Kaynaklari:\n');

    const urlSourceRes = await client.query(`
      SELECT 
        CASE
          WHEN cloudinary_url IS NOT NULL THEN 'Cloudinary'
          WHEN gorsel_url LIKE 'https://res.cloudinary.com%' THEN 'Cloudinary (gorsel_url)'
          WHEN gorsel_url LIKE '%cloudinary%' THEN 'Cloudinary (gorsel_url)'
          WHEN gorsel_url IS NOT NULL THEN 'Diger URL'
          ELSE 'Resim yok'
        END as source,
        COUNT(*) as count
      FROM urunler
      GROUP BY source
      ORDER BY count DESC
    `);

    urlSourceRes.rows.forEach(row => {
      console.log(`  * ${row.source}: ${row.count}`);
    });

    // 5. Cloudinary public_id analizi
    console.log('\n\nCloudinary Public ID Analizi:\n');

    const publicIdRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN cloudinary_public_id IS NOT NULL THEN 1 END) as with_id,
        COUNT(CASE WHEN cloudinary_public_id IS NULL THEN 1 END) as without_id
      FROM urunler
    `);

    const pubStats = publicIdRes.rows[0];
    console.log(`  * Public ID var: ${pubStats.with_id} urun`);
    console.log(`  * Public ID yok: ${pubStats.without_id} urun`);

    // 6. Airtable sync durumu
    console.log('\n\nAirtable Senkronizasyon Durumu:\n');

    const syncRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN synced_at IS NOT NULL THEN 1 END) as synced,
        COUNT(CASE WHEN synced_at IS NULL THEN 1 END) as not_synced,
        COUNT(CASE WHEN airtable_created_time IS NOT NULL THEN 1 END) as from_airtable
      FROM urunler
    `);

    const syncStats = syncRes.rows[0];
    console.log(`  * Airtable'dan geldi: ${syncStats.from_airtable} urun`);
    console.log(`  * Senkron edildi: ${syncStats.synced} urun`);
    console.log(`  * Senkron degil: ${syncStats.not_synced} urun`);

    // 7. Broken URLs kontrol
    console.log('\n\nSorunlu Resim URL\'leri:\n');

    const brokenRes = await client.query(`
      SELECT COUNT(*) as cnt FROM urunler
      WHERE cloudinary_url LIKE '%undefined%'
      OR cloudinary_url LIKE '%null%'
      OR (cloudinary_url IS NOT NULL AND cloudinary_url = '')
    `);

    console.log(`  * Hatali cloudinary_url: ${brokenRes.rows[0].cnt}`);

    // 8. Sample ürünler
    console.log('\n\nSample Urunler (Resim Var):\n');

    const sampleRes = await client.query(`
      SELECT 
        id,
        urun_adi,
        cloudinary_url,
        cloudinary_public_id,
        gorsel_url,
        aktif
      FROM urunler
      WHERE cloudinary_url IS NOT NULL
      LIMIT 5
    `);

    sampleRes.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.urun_adi}`);
      console.log(`     ID: ${row.id}`);
      if (row.cloudinary_url) {
        console.log(`     Cloudinary: ${row.cloudinary_url.substring(0, 80)}...`);
        console.log(`     Public ID: ${row.cloudinary_public_id}`);
      }
      if (row.gorsel_url && row.gorsel_url !== row.cloudinary_url) {
        console.log(`     Orijinal: ${row.gorsel_url.substring(0, 60)}...`);
      }
      console.log(`     Aktif: ${row.aktif ? 'EVET' : 'HAYIR'}\n`);
    });

    // 9. Resim olmayan ürünler
    console.log('\n\nResim Olmayan Urunler:\n');

    const noImageRes = await client.query(`
      SELECT 
        id,
        urun_adi,
        kategori,
        aktif
      FROM urunler
      WHERE cloudinary_url IS NULL AND gorsel_url IS NULL
      LIMIT 10
    `);

    console.log(`  (Toplam ${totalCount - stats.with_cloudinary} adet)`);
    console.log(`  Ornekler:\n`);
    noImageRes.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.urun_adi} (${row.kategori}) - ${row.aktif ? 'Aktif' : 'Inaktif'}`);
    });

    // 10. DB relationship diagram
    console.log('\n\nIliskili Tablo Sema:\n');
    console.log(`  URUNLER (${totalCount} rows)`);
    console.log(`  +-- cloudinary_url -----> Cloudinary CDN (${stats.with_cloudinary} refs)`);
    console.log(`  +-- cloudinary_public_id -> Unique ID in Cloudinary`);
    console.log(`  +-- gorsel_url ---------> Original image URL (${stats.with_gorsel} refs)`);
    console.log(`  +-- aktif ---------> Active/Inactive flag`);
    console.log(`  +-- airtable_created_time -> Sync source (Airtable)\n`);

    // 11. Recommendations
    console.log('\nTavsiyeler:\n');

    if (stats.no_image > 0) {
      const percent = (stats.no_image / stats.cnt * 100).toFixed(1);
      console.log(`  [!] ${stats.no_image} urun (${percent}%) resim olmadan`);
      console.log(`      -> Bu urunlere resim ekle veya kaldir\n`);
    }

    if (stats.with_gorsel > stats.with_cloudinary) {
      const diff = stats.with_gorsel - stats.with_cloudinary;
      console.log(`  [!] ${diff} urun sadece gorsel_url'si var (Cloudinary yok)`);
      console.log(`      -> Cloudinary'ye yukle ve URL guncelle\n`);
    }

    console.log(`  [OK] ${stats.with_cloudinary} urun (${(stats.with_cloudinary/stats.cnt*100).toFixed(1)}%) Cloudinary'de`);
    console.log(`  [OK] ${pubStats.with_id} urun public_id'ye sahip\n`);

    console.log('Analiz tamamlandi!\n');

    await client.end();

  } catch (err) {
    console.error('HATA:', err.message);
    process.exit(1);
  }
})();
