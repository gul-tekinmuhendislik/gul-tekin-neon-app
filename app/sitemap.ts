import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gul-tekinmuhendislik.com';
  const now = new Date().toISOString();

  // 1. Statik Ana ve Kurumsal Sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/hizmetler`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/urunler`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/projeler`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/markalar`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/lokasyonlar`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const entries: MetadataRoute.Sitemap = [...staticPages];

  try {
    // 2. Blog Yazıları (generated_content + blog_posts)
    const blogPosts = await sql`
      SELECT slug, updated_at, created_at
      FROM (
        SELECT slug, updated_at, created_at FROM generated_content WHERE status IN ('completed', 'published')
        UNION
        SELECT slug, updated_at, created_at FROM blog_posts WHERE status = 'published'
      ) combined
      WHERE slug IS NOT NULL AND slug != ''
      ORDER BY updated_at DESC
    `;

    for (const post of blogPosts) {
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updated_at || post.created_at || now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch (err) {
    console.error('Sitemap blog query error:', err);
  }

  try {
    // 3. Ürünler
    const urunler = await sql`
      SELECT slug, updated_at
      FROM urunler
      WHERE aktif = true AND slug IS NOT NULL AND slug != ''
      ORDER BY id ASC
    `;

    for (const urun of urunler) {
      entries.push({
        url: `${baseUrl}/urunler/${urun.slug}`,
        lastModified: urun.updated_at || now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error('Sitemap urunler query error:', err);
  }

  try {
    // 4. Hizmetler
    const hizmetler = await sql`
      SELECT slug, updated_at
      FROM hizmetler
      WHERE aktif = true AND slug IS NOT NULL AND slug != ''
      ORDER BY id ASC
    `;

    for (const hizmet of hizmetler) {
      entries.push({
        url: `${baseUrl}/hizmetler/${hizmet.slug}`,
        lastModified: hizmet.updated_at || now,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error('Sitemap hizmetler query error:', err);
  }

  try {
    // 5. Projeler
    const projeler = await sql`
      SELECT slug, updated_at
      FROM projeler_gul_tekin
      WHERE aktif = true AND slug IS NOT NULL AND slug != ''
      ORDER BY id DESC
      LIMIT 500
    `;

    for (const proje of projeler) {
      entries.push({
        url: `${baseUrl}/projeler/${proje.slug}`,
        lastModified: proje.updated_at || now,
        changeFrequency: 'yearly',
        priority: 0.5,
      });
    }
  } catch (err) {
    console.error('Sitemap projeler query error:', err);
  }

  try {
    // 6. Lokasyonlar (İlçe ve Mahalle Sayfaları)
    const lokasyonlar = await sql`
      SELECT
        hl.slug as lokasyon_slug,
        hl.updated_at,
        m.slug as mahalle_slug,
        m.updated_at as mahalle_updated_at
      FROM hizmet_lokasyonlari hl
      LEFT JOIN mahalleler m ON m.ilce_id = hl.id
      WHERE hl.aktif = true AND hl.slug IS NOT NULL
    `;

    const addedIlceler = new Set<string>();

    for (const lok of lokasyonlar) {
      // İlçe ana sayfası (/lokasyonlar/[ilce])
      if (lok.lokasyon_slug && !addedIlceler.has(lok.lokasyon_slug)) {
        addedIlceler.add(lok.lokasyon_slug);
        entries.push({
          url: `${baseUrl}/lokasyonlar/${lok.lokasyon_slug}`,
          lastModified: lok.updated_at || now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      // Mahalle sayfası (/lokasyonlar/[ilce]/[mahalle])
      if (lok.lokasyon_slug && lok.mahalle_slug) {
        entries.push({
          url: `${baseUrl}/lokasyonlar/${lok.lokasyon_slug}/${lok.mahalle_slug}`,
          lastModified: lok.mahalle_updated_at || lok.updated_at || now,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.error('Sitemap lokasyonlar query error:', err);
  }

  return entries;
}
