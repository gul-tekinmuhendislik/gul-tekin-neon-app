import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log('='.repeat(60));
  console.log('🔍 NEON VERİTABANI VERİLERİ');
  console.log('='.repeat(60));

  try {
    // 1. Hizmetler
    console.log('\n📋 HİZMETLER:');
    console.log('-'.repeat(40));
    const hizmetler = await sql`SELECT id, hizmet_adi, slug, kategori, aktif FROM hizmetler ORDER BY hizmet_adi`;
    console.table(hizmetler);

    // 2. Markalar
    console.log('\n🏷️ MARKALAR:');
    console.log('-'.repeat(40));
    const markalar = await sql`SELECT id, marka_adi, logo_url, kategori, aktif, siralama_no FROM markalar ORDER BY siralama_no NULLS LAST, marka_adi`;
    console.table(markalar);

    // 3. Ürünler
    console.log('\n🛒 ÜRÜNLER:');
    console.log('-'.repeat(40));
    const urunler = await sql`SELECT id, urun_adi, slug, marka, kategori, aktif FROM urunler ORDER BY urun_adi LIMIT 50`;
    console.table(urunler);

    // 4. Projeler
    console.log('\n🏗️ PROJELER:');
    console.log('-'.repeat(40));
    const projeler = await sql`SELECT id, proje_adi, ilce, mahalle, aktif, sira FROM projeler_gul_tekin WHERE aktif = true ORDER BY sira NULLS LAST, proje_adi`;
    console.table(projeler);

    // 5. Blog İçerikleri
    console.log('\n📝 BLOG İÇERİKLERİ:');
    console.log('-'.repeat(40));
    const blogPosts = await sql`SELECT id, topic, title, status, created_at, published_at FROM generated_content ORDER BY created_at DESC LIMIT 20`;
    console.table(blogPosts);

    // 6. FAQ
    console.log('\n❓ SIKÇA SORULAN SORULAR:');
    console.log('-'.repeat(40));
    const faq = await sql`SELECT id, soru, kategori, aktif, siralama_no FROM faq WHERE aktif = true ORDER BY siralama_no NULLS LAST, id`;
    console.table(faq);

    // 7. Lokasyonlar
    console.log('\n📍 HİZMET LOKASYONLARI:');
    console.log('-'.repeat(40));
    const lokasyonlar = await sql`SELECT id, ilce_adi, slug, il, aktif, sira FROM hizmet_lokasyonlari ORDER BY sira NULLS LAST, ilce_adi`;
    console.table(lokasyonlar);

    // 8. Renk Şemaları
    console.log('\n🎨 RENK ŞEMALARI:');
    console.log('-'.repeat(40));
    const renkSemalari = await sql`SELECT id, name, topic_key, is_active FROM color_schemes`;
    console.table(renkSemalari);

    // 9. Stil Presetleri
    console.log('\n✨ STİL PRESETLERİ:');
    console.log('-'.repeat(40));
    const stilPresetleri = await sql`SELECT id, name, category, is_active FROM style_presets`;
    console.table(stilPresetleri);

    // 10. Görsel Elementler
    console.log('\n🖼️ GÖRSEL ELEMENTLER:');
    console.log('-'.repeat(40));
    const görselElementler = await sql`SELECT id, name, topic_key, element_type, is_active FROM visual_elements`;
    console.table(görselElementler);

    // 11. Kompozisyon Kuralları
    console.log('\n📐 KOMPOZİSYON KURALLARI:');
    console.log('-'.repeat(40));
    const kompozisyonKurallari = await sql`SELECT id, name, layout_type, is_active, weight FROM composition_rules`;
    console.table(kompozisyonKurallari);

    // 12. Sosyal Medya Postları
    console.log('\n📱 SOSYAL MEDYA POSTLARI:');
    console.log('-'.repeat(40));
    const sosyalPostlar = await sql`SELECT id, content_id, platform, status, posted_at FROM social_media_posts ORDER BY created_at DESC LIMIT 20`;
    console.table(sosyalPostlar);

    // İstatistikler
    console.log('\n' + '='.repeat(60));
    console.log('📊 İSTATİSTİKLER:');
    console.log('='.repeat(60));
    
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM hizmetler WHERE aktif = true) as hizmet_sayisi,
        (SELECT COUNT(*) FROM markalar WHERE aktif = true) as marka_sayisi,
        (SELECT COUNT(*) FROM urunler WHERE aktif = true) as urun_sayisi,
        (SELECT COUNT(*) FROM projeler_gul_tekin WHERE aktif = true) as proje_sayisi,
        (SELECT COUNT(*) FROM generated_content WHERE status = 'published') as blog_sayisi,
        (SELECT COUNT(*) FROM faq WHERE aktif = true) as faq_sayisi,
        (SELECT COUNT(*) FROM hizmet_lokasyonlari WHERE aktif = true) as lokasyon_sayisi
    `;
    console.table(stats);

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

main();

