import { MetadataRoute } from "next";
import { siteConfig } from "./metadata";
import { sql } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const currentDate = new Date().toISOString();

  // Blog yazılarını veritabanından çek
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await sql`
      SELECT slug, updated_at 
      FROM generated_content 
      WHERE status IN ('completed', 'published')
      ORDER BY created_at DESC
    `;
    
    blogPosts = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  // Hizmetler sayfalarını veritabanından çek
  let hizmetlerPages: MetadataRoute.Sitemap = [];
  try {
    const hizmetler = await sql`
      SELECT slug, updated_at 
      FROM hizmetler 
      WHERE aktif = true
      ORDER BY id ASC
    `;
    
    hizmetlerPages = hizmetler.map((hizmet) => ({
      url: `${baseUrl}/hizmetler/${hizmet.slug}`,
      lastModified: hizmet.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching hizmetler for sitemap:", error);
  }

  // Ürünler sayfalarını veritabanından çek
  let urunlerPages: MetadataRoute.Sitemap = [];
  try {
    const urunler = await sql`
      SELECT slug, updated_at 
      FROM urunler 
      WHERE aktif = true
      ORDER BY id ASC
    `;
    
    urunlerPages = urunler.map((urun) => ({
      url: `${baseUrl}/urunler/${urun.slug}`,
      lastModified: urun.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching urunler for sitemap:", error);
  }

  // Projeler sayfalarını veritabanından çek
  let projelerPages: MetadataRoute.Sitemap = [];
  try {
    const projeler = await sql`
      SELECT slug, updated_at
      FROM projeler_gul_tekin
      WHERE aktif = true
      ORDER BY id DESC
      LIMIT 500
    `;

    projelerPages = projeler.map((proje) => ({
      url: `${baseUrl}/projeler/${proje.slug}`,
      lastModified: proje.updated_at,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error("Error fetching projeler for sitemap:", error);
  }

  // Lokasyon sayfalarını veritabanından çek
  let lokasyonPages: MetadataRoute.Sitemap = [];
  try {
    const lokasyonlar = await sql`
      SELECT
        hl.slug as lokasyon_slug,
        hl.updated_at,
        m.slug as mahalle_slug,
        m.updated_at as mahalle_updated_at
      FROM hizmet_lokasyonlari hl
      LEFT JOIN mahalleler m ON m.ilce_id = hl.id
      WHERE hl.aktif = true AND m.slug IS NOT NULL
    `;

    lokasyonPages = lokasyonlar.map((lokasyon) => ({
      url: `${baseUrl}/lokasyonlar/${lokasyon.lokasyon_slug}/${lokasyon.mahalle_slug}`,
      lastModified: lokasyon.mahalle_updated_at || lokasyon.updated_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching lokasyon pages for sitemap:", error);
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hizmetler`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/urunler`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/projeler`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/markalar`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ai`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticPages, ...blogPosts, ...hizmetlerPages, ...urunlerPages, ...projelerPages, ...lokasyonPages];
}