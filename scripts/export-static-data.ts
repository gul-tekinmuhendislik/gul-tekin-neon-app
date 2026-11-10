import { sql } from "@/lib/db";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "static");

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function writeJson(name: string, data: unknown) {
  ensureDir(DATA_DIR);
  writeFileSync(join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

async function main() {
  console.log("Starting static data export...");

  // 1. Urunler (products)
  const urunler = await sql`
    SELECT id, urun_adi, slug, aciklama, fiyat, kategori, marka, sku, stokta,
           etiketler, gorsel_url, cloudinary_url, cloudinary_public_id,
           aktif, siralama_no, ozellikler, agirlik, boyutlar,
           airtable_created_time, synced_at, updated_at,
           hizmet_id, hizmet_adi, anasayfa_goster
    FROM urunler
    ORDER BY updated_at DESC NULLS LAST, kategori, urun_adi
  `;
  writeJson("urunler", urunler);
  console.log(`  urunler: ${urunler.length} rows`);

  // 2. Hizmetler (services)
  const hizmetler = await sql`
    SELECT id, hizmet_adi, aciklama, kategori, ana_faaliyet_konusu, resim_url,
           markalar, marka_text, urunler, seo_title, seo_description, seo_index,
           aktif, airtable_modified, synced_at, updated_at,
           cloudinary_url, cloudinary_public_id, slug
    FROM hizmetler
    ORDER BY seo_index ASC NULLS LAST, updated_at DESC
  `;
  writeJson("hizmetler", hizmetler);
  console.log(`  hizmetler: ${hizmetler.length} rows`);

  // 3. Markalar (brands)
  const markalar = await sql`
    SELECT id, marka_adi, logo_url, website, kategori, aciklama, yetkili_servis,
           aktif, siralama_no, airtable_created_time, synced_at, updated_at,
           slug, email, url, cloudinary_url, cloudinary_public_id,
           airtable_hizmetler_id, airtable_faaliyet_id, domain, domain_status
    FROM markalar
    ORDER BY siralama_no ASC NULLS LAST, updated_at DESC
  `;
  writeJson("markalar", markalar);
  console.log(`  markalar: ${markalar.length} rows`);

  // 4. Projeler (projects)
  const projeler = await sql`
    SELECT id, airtable_id, proje_adi, slug, aciklama, mahalle, ilce,
           baslangic_tarihi, bitis_tarihi, proje_yili, ana_faaliyet_konusu,
           airtable_resim_url, airtable_galeri_urls, cloudinary_url,
           cloudinary_public_id, cloudinary_galeri_urls, cloudinary_galeri_public_ids,
           aktif, sira, airtable_last_modified, created_at, updated_at, synced_at
    FROM projeler_gul_tekin
    ORDER BY sira ASC NULLS LAST, baslangic_tarihi DESC NULLS LAST, id DESC
  `;
  writeJson("projeler", projeler);
  console.log(`  projeler: ${projeler.length} rows`);

  // 5. Generated content (blog posts from AI generation)
  const generatedContent = await sql`
    SELECT id, topic, title, content, meta_title, meta_description, keywords,
           search_data, status, published_at, created_at, updated_at,
           slug, metadata, prompt, image_url, image_prompt
    FROM generated_content
    WHERE status IN ('completed', 'published')
    ORDER BY updated_at DESC
  `;
  writeJson("generated_content", generatedContent);
  console.log(`  generated_content: ${generatedContent.length} rows`);

  // 6. Blog posts
  const blogPosts = await sql`
    SELECT id, title, slug, content, summary, image_url, cloudinary_url,
           cloudinary_public_id, category, tags, author, status,
           published_at, seo_title, seo_description, seo_keywords, read_time,
           view_count, created_at, updated_at
    FROM blog_posts
    WHERE status = 'published'
    ORDER BY published_at DESC NULLS LAST, created_at DESC
  `;
  writeJson("blog_posts", blogPosts);
  console.log(`  blog_posts: ${blogPosts.length} rows`);

  // 7. Hizmet lokasyonlari + Mahalleler (locations)
  const lokasyonlar = await sql`
    SELECT hl.id, hl.ilce_adi, hl.slug, hl.il, hl.aciklama, hl.resim_url,
           hl.aktif, hl.sira, hl.created_at, hl.updated_at
    FROM hizmet_lokasyonlari hl
    WHERE hl.aktif = true
    ORDER BY hl.sira ASC NULLS LAST, hl.ilce_adi ASC
  `;
  writeJson("hizmet_lokasyonlari", lokasyonlar);

  const mahalleler = await sql`
    SELECT m.id, m.ilce_id, m.mahalle_adi, m.slug, m.proje_sayisi,
           m.created_at, m.updated_at, m.aciklama
    FROM mahalleler m
    ORDER BY m.mahalle_adi ASC
  `;
  writeJson("mahalleler", mahalleler);
  console.log(`  hizmet_lokasyonlari: ${lokasyonlar.length} rows`);
  console.log(`  mahalleler: ${mahalleler.length} rows`);

  // 8. FAQ
  const faqs = await sql`
    SELECT id, soru, cevap, kategori, sayfa_tipi, sayfa_slug, siralama_no,
           aktif, created_at, updated_at
    FROM faq
    WHERE aktif = true
    ORDER BY kategori ASC NULLS LAST, siralama_no ASC NULLS LAST, id ASC
  `;
  writeJson("faq", faqs);
  console.log(`  faq: ${faqs.length} rows`);

  // 9. Navigation menu
  const navigationMenu = await sql`
    SELECT id, title, href, order_index, is_active, parent_id, icon,
           target, created_at, updated_at
    FROM navigation_menu
    WHERE is_active = true
    ORDER BY order_index ASC, id ASC
  `;
  writeJson("navigation_menu", navigationMenu);
  console.log(`  navigation_menu: ${navigationMenu.length} rows`);

  console.log("\nStatic data export complete!");
  console.log(`Output directory: ${DATA_DIR}`);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
