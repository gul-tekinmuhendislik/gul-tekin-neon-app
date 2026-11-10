import { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/static-data';
import { getAllUrunler } from '@/lib/static-data';
import { getAllHizmetler } from '@/lib/static-data';
import { getAllProjeler } from '@/lib/static-data';
import { getAllLokasyonlar } from '@/lib/static-data';
import { getAllMahalleler } from '@/lib/static-data';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
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
    { url: `${baseUrl}/isi-pompasi-sorunlari-ve-cozumleri`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const entries: MetadataRoute.Sitemap = [...staticPages];

  // 2. Blog Yazıları
  try {
    const blogPosts = getAllBlogPosts();
    for (const post of blogPosts) {
      if (!post.slug) continue;
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updated_at || post.created_at || now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch (err) {
    console.error('Sitemap blog error:', err);
  }

  // 3. Ürünler
  try {
    const urunler = getAllUrunler().filter((u) => u.aktif !== false && u.slug);
    for (const urun of urunler) {
      entries.push({
        url: `${baseUrl}/urunler/${urun.slug}`,
        lastModified: urun.updated_at || now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error('Sitemap urunler error:', err);
  }

  // 4. Hizmetler
  try {
    const hizmetler = getAllHizmetler().filter((h) => h.aktif !== false && h.slug);
    for (const hizmet of hizmetler) {
      entries.push({
        url: `${baseUrl}/hizmetler/${hizmet.slug}`,
        lastModified: hizmet.updated_at || now,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error('Sitemap hizmetler error:', err);
  }

  // 5. Projeler
  try {
    const projeler = getAllProjeler().filter((p) => p.aktif !== false && p.slug);
    for (const proje of projeler) {
      entries.push({
        url: `${baseUrl}/projeler/${proje.slug}`,
        lastModified: proje.updated_at || now,
        changeFrequency: 'yearly',
        priority: 0.5,
      });
    }
  } catch (err) {
    console.error('Sitemap projeler error:', err);
  }

  // 6. Lokasyonlar (İlçe ve Mahalle Sayfaları)
  try {
    const lokasyonlar = getAllLokasyonlar().filter((l) => l.aktif !== false && l.slug);
    const mahalleler = getAllMahalleler().filter((m) => m.slug);

    const addedIlceler = new Set<string>();

    for (const lok of lokasyonlar) {
      // İlçe ana sayfası (/lokasyonlar/[ilce])
      if (lok.slug && !addedIlceler.has(lok.slug)) {
        addedIlceler.add(lok.slug);
        entries.push({
          url: `${baseUrl}/lokasyonlar/${lok.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      // Mahalle sayfası (/lokasyonlar/[ilce]/[mahalle])
      const mahalleList = mahalleler.filter((m) => m.ilce_id === lok.id);
      for (const mahalle of mahalleList) {
        entries.push({
          url: `${baseUrl}/lokasyonlar/${lok.slug}/${mahalle.slug}`,
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.error('Sitemap lokasyonlar error:', err);
  }

  return entries;
}
