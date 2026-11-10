import fs from "fs";
import path from "path";

export type HomeMetrics = {
  projectCount: number;
  locationCount: number;
  updatedAt: string;
};

const staticDir = path.join(process.cwd(), "data", "static");

const defaultHomeMetrics: HomeMetrics = {
  projectCount: 236,
  locationCount: 13,
  updatedAt: new Date().toISOString(),
};

export function readStaticJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Static data read failed for ${filePath}:`, error);
    return fallback;
  }
}

function readTable<T>(name: string, fallback: T[]): T[] {
  return readStaticJson<T[]>(path.join(staticDir, `${name}.json`), fallback);
}

function readOne<T>(name: string, slugField: string, slug: string): T | null {
  const rows = readTable<T>(name, []);
  return rows.find((row: any) => row[slugField] === slug) || null;
}

export function getHomeMetrics(): HomeMetrics {
  const staticHomeMetrics = readStaticJson<HomeMetrics>(
    path.join(staticDir, "home.json"),
    defaultHomeMetrics
  );
  return staticHomeMetrics;
}

// Compute metrics from static snapshot data (no DB calls)
export function getHomeMetricsFromSnapshot(): HomeMetrics {
  const projeler = getAllProjeler();
  const lokasyonlar = getAllLokasyonlar();
  return {
    projectCount: projeler.length,
    locationCount: lokasyonlar.length,
    updatedAt: new Date().toISOString(),
  };
}

export type Urun = {
  id: string;
  urun_adi: string;
  slug: string;
  aciklama?: string;
  fiyat?: number;
  kategori?: string;
  marka?: string;
  sku?: string;
  stokta?: boolean;
  etiketler?: string[];
  gorsel_url?: string;
  cloudinary_url?: string;
  cloudinary_public_id?: string;
  aktif?: boolean;
  siralama_no?: number;
  ozellikler?: string;
  agirlik?: number;
  boyutlar?: string;
  synced_at?: string;
  updated_at?: string;
  hizmet_id?: string;
  hizmet_adi?: string;
  anasayfa_goster?: boolean;
};

export function getAllUrunler(): Urun[] {
  return readTable<Urun>("urunler", []);
}

export function getUrunBySlug(slug: string): Urun | null {
  return readOne<Urun>("urunler", "slug", slug);
}

export function getUrunlerByKategori(kategori: string): Urun[] {
  return getAllUrunler().filter((u) => u.kategori === kategori);
}

export function getUrunlerByMarka(marka: string): Urun[] {
  return getAllUrunler().filter((u) => u.marka?.toLowerCase() === marka.toLowerCase());
}

export function getUrunlerByHizmetId(hizmetId: string): Urun[] {
  return getAllUrunler().filter((u) => u.hizmet_id === hizmetId);
}

export function getUrunCategories(): { kategori: string; count: number }[] {
  const urunler = getAllUrunler();
  const map = new Map<string, number>();
  for (const u of urunler) {
    if (u.kategori) {
      map.set(u.kategori, (map.get(u.kategori) || 0) + 1);
    }
  }
  return Array.from(map.entries()).map(([kategori, count]) => ({ kategori, count }));
}

export function getUrunBrands(): { marka: string; count: number }[] {
  const urunler = getAllUrunler();
  const map = new Map<string, number>();
  for (const u of urunler) {
    if (u.marka) {
      map.set(u.marka, (map.get(u.marka) || 0) + 1);
    }
  }
  return Array.from(map.entries()).map(([marka, count]) => ({ marka, count }));
}

export type Hizmet = {
  id: string;
  hizmet_adi: string;
  slug: string;
  aciklama?: string;
  kategori?: string;
  resim_url?: string;
  cloudinary_url?: string;
  marka_text?: string[];
  ana_faaliyet_konusu?: string[];
  urunler?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_index?: number;
  aktif?: boolean;
  updated_at?: string;
};

export function getAllHizmetler(): Hizmet[] {
  return readTable<Hizmet>("hizmetler", []);
}

export function getHizmetBySlug(slug: string): Hizmet | null {
  return readOne<Hizmet>("hizmetler", "slug", slug);
}

export type Marka = {
  id: string;
  marka_adi: string;
  slug: string;
  aciklama?: string;
  website?: string;
  logo_url?: string;
  cloudinary_url?: string;
  kategori?: string;
  aktif?: boolean;
  yetkili_servis?: boolean;
  siralama_no?: number;
  updated_at?: string;
  email?: string;
  url?: string;
};

export function getAllMarkalar(): Marka[] {
  return readTable<Marka>("markalar", []);
}

export function getMarkaBySlug(slug: string): Marka | null {
  return readOne<Marka>("markalar", "slug", slug);
}

export type Proje = {
  id: number;
  airtable_id: string;
  proje_adi: string;
  slug: string;
  aciklama: string;
  mahalle: string;
  ilce: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  proje_yili: string;
  ana_faaliyet_konusu: string[];
  airtable_resim_url: string;
  airtable_galeri_urls: string[];
  cloudinary_url: string;
  cloudinary_public_id: string;
  cloudinary_galeri_urls: string[];
  cloudinary_galeri_public_ids: string[];
  aktif: boolean;
  sira: number;
  updated_at: string;
};

export function getAllProjeler(): Proje[] {
  return readTable<Proje>("projeler", []);
}

export function getProjeBySlug(slug: string): Proje | null {
  return readOne<Proje>("projeler", "slug", slug);
}

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  image_url?: string;
  cloudinary_url?: string;
  category?: string;
  tags: string[];
  author?: string;
  status?: string;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  read_time?: number;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type GeneratedContent = {
  id: number;
  topic: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  keywords: string[];
  status?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  slug?: string;
  image_url?: string;
};

export function getAllBlogPosts(): BlogPost[] {
  const posts = readTable<BlogPost>("blog_posts", []);
  const generated = readTable<GeneratedContent>("generated_content", [])
    .filter((g) => g.status === "completed" || g.status === "published")
    .map((g) => ({
      id: g.id,
      title: g.title,
      slug: g.slug!,
      content: g.content,
      summary: g.meta_description,
      image_url: g.image_url,
      category: g.topic,
      tags: g.keywords,
      status: g.status,
      published_at: g.published_at,
      seo_title: g.meta_title,
      seo_description: g.meta_description,
      seo_keywords: g.keywords,
      created_at: g.created_at,
      updated_at: g.updated_at,
    }));
  return [...posts, ...generated].sort(
    (a, b) =>
      new Date(b.published_at || b.updated_at || b.created_at || 0).getTime() -
      new Date(a.published_at || a.updated_at || a.created_at || 0).getTime()
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getAllBlogPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export function getAllBlogPostSlugs(): string[] {
  return getAllBlogPosts().map((p) => p.slug).filter(Boolean);
}

export type Lokasyon = {
  id: number;
  ilce_adi: string;
  slug: string;
  il?: string;
  aciklama?: string;
  resim_url?: string;
  aktif?: boolean;
  sira?: number;
};

export type Mahalle = {
  id: number;
  ilce_id: number;
  mahalle_adi: string;
  slug: string;
  proje_sayisi?: number;
  aciklama?: string;
};

export function getAllLokasyonlar(): Lokasyon[] {
  return readTable<Lokasyon>("hizmet_lokasyonlari", []);
}

export function getAllMahalleler(): Mahalle[] {
  return readTable<Mahalle>("mahalleler", []);
}

export type FAQ = {
  id: number;
  soru: string;
  cevap: string;
  kategori?: string;
  sayfa_tipi?: string;
  sayfa_slug?: string;
  siralama_no?: number;
  aktif?: boolean;
};

export function getAllFAQs(): FAQ[] {
  return readTable<FAQ>("faq", []);
}

export function getFAQsByKategori(kategori: string): FAQ[] {
  return getAllFAQs().filter((f) => f.kategori === kategori);
}

export function getFAQsBySayfa(sayfa_tipi: string, sayfa_slug: string): FAQ[] {
  return getAllFAQs().filter(
    (f) => f.sayfa_tipi === sayfa_tipi && f.sayfa_slug === sayfa_slug
  );
}

export type NavItem = {
  id: number;
  title: string;
  href: string;
  order_index: number;
  is_active?: boolean;
  parent_id?: number;
  icon?: string;
  target?: string;
};

export function getAllNavigationMenu(): NavItem[] {
  return readTable<NavItem>("navigation_menu", []);
}
