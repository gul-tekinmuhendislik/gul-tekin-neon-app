# MEMORY.md - Gül-Tekin Mühendislik İçin

## Neon Database (PostgreSQL)

**Connection:** `postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`

**Status:** ✅ Connected and Verified (2026-03-08)

### Veritabanı Yapısı (31 Tablo)

#### Ürün & Hizmet Yönetimi
- **URUNLER** (399 rows) — Ürün kataloğu
  - Sütunlar: id, urun_adi, slug, aciklama, fiyat, kategori, marka, sku, stokta, gorsel_url, cloudinary_url, anasayfa_goster
  - Key: anasayfa_goster, anasayfa_baslik, anasayfa_aciklama (ana sayfa için özel alan)

- **HIZMETLER** (13 rows) — Sunulan hizmetler
  - Sütunlar: id, hizmet_adi, aciklama, kategori, ana_faaliyet_konusu, resim_url, markalar, urunler
  - Synced from Airtable

- **MARKALAR** (45 rows) — Marka bilgileri
  - Sütunlar: id, marka_adi, logo_url, website, kategori, yetkili_servis
  - Synced from Airtable

- **PROJELER_GUL_TEKIN** (236 rows) — Tamamlanan projeler
  - Sütunlar: airtable_id, proje_adi, slug, aciklama, mahalle, ilce, baslangic_tarihi, bitis_tarihi
  - Galerileri: cloudinary_galeri_urls, cloudinary_galeri_public_ids

#### Sosyal Medya & İçerik
- **TWITTER_POSTS** (0 rows) — Twitter post history
  - Sütunlar: tweet_id, content, media_urls, posted_at, engagement
  - **KullanIm:** Günlük otomatik post kaydı

- **SOCIAL_MEDIA_POSTS** (192 rows) — Çok platform sosyal medya
  - Sütunlar: content_id, platform, post_id, post_data, status, posted_at
  - Platforms: Twitter, Facebook, LinkedIn?

- **SOCIAL_TOKENS** (1 row) — Platform auth tokens
  - Sütunlar: platform, token_type, access_token, page_id, page_name, expires_at

#### İçerik Üretimi
- **GENERATED_CONTENT** (130 rows) — AI-generated content
- **GENERATED_IMAGES** (110 rows) — Resim üretim history
- **VERTEX_IMAGES** (3442 rows) — Vertex AI generated images
- **BLOG_POSTS** (1 row) — Blog yazıları

#### Diğer Tablolar
- **CONTACT_MESSAGES** (29 rows) — İletişim formu mesajları
- **MAHALLELER** (603 rows) — Mahalle bilgileri
- **HIZMET_LOKASYONLARI** (13 rows) — Hizmet verildiği lokasyonlar
- **EVENT_LOGS** (111 rows) — Sistem olayları
- **SEARCH_RESULTS** (598 rows) — Arama sonuçları cache
- ... ve daha fazlası

---

## Otomasyonlar

### 1. Günlük Twitter + Facebook Post
**Status:** ⏳ Kurulum aşamasında
- **Script:** `post-daily.js` (OAuth 1.0a)
- **Zamanlama:** Her gün 15:00 (Europe/Istanbul)
- **Cron Job ID:** `3b703853-8883-4e03-824a-30c3b7f1f7be`
- **İçerik:** Rastgele ürün seçimi, Format 1 (basit)
- **Kaynaklar:** `products.json` (20 ürün)
- **Hedef Tables:**
  - TWITTER_POSTS — tweet_id, content, posted_at kaydı
  - SOCIAL_MEDIA_POSTS — multi-platform tracking

**Problem:** Twitter credentials (401 error) — yeni keys eklenecek

### 2. Airtable Sync (Existing)
- Ürün, hizmet, marka, projeler otomatik güncellemeler
- Last sync: SYNCED_AT columns

### 3. Google Search Console — SEO Performans Takibi
**Status:** ✅ Aktif (2026-05-26)
- **OAuth:** Google hesabı ile yetkilendirme tamamlandı
- **DB Tabloları:** `seo_performance`, `seo_pages`, `seo_keywords`, `seo_backlinks`, `seo_errors`, `seo_sitemaps`
- **Dashboard:** `/admin/seo` — performans metrikleri, trend grafikleri, cihaz karşılaştırması
- **API Endpoints:** `/api/search-console/{auth,callback,setup,analytics,sync,summary}`
- **Senkronizasyon:** Manuel (admin panel butonu) veya `POST /api/search-console/sync`
- **Önerilen:** Günlük otomatik sync için cron job (örn. her gün 03:00)
- **Yeniden Yetkilendirme:** Token süresi dolarsa `/admin/seo` → "Google ile Yetkilendir"
- **Detaylı Dokümantasyon:** `docs/search-console-setup.md`

---

## Credentials & Keys (.env)

✅ **Kaydedilmiş:**
- Neon Database URL (pooled + unpooled)
- Twitter (Bearer Token, Consumer Key/Secret, Access Token/Secret)
- Facebook (Page ID, Access Token)
- Airtable (API Key, Base ID, Table IDs)
- Cloudinary (API credentials)
- Google APIs (Gemini, Drive, etc.)
- Vercel AI Gateway
- ... diğer servisler

⚠️ **Güvenlik Notu:** Eski Twitter credentials Telegram'da paylaşıldı → regenerate gerekli

---

## Todo

- [ ] Twitter credentials'ı regenerate et ve test et
- [ ] Facebook test post at
- [ ] TWITTER_POSTS tablosuna günlük post kaydını ekleme script'i yaz
- [ ] post-daily.js → TWITTER_POSTS + SOCIAL_MEDIA_POSTS'e INSERT
- [ ] Veritabanı monitoring dashboard (opsiyonel)
- [ ] URUNLER'e yeni sütunlar ekle (opsiyonel: rating, featured, supplier_info)

---

## Google Search Console Integration

**Status:** ✅ Active (2026-05-26)
**OAuth:** Completed — token stored in `google_tokens` (platform: `search_console`)

### Database Tables

| Table | Status |
|---|---|
| `seo_performance` | ✅ Created (dynamic, unique on date+query+page+device+country) |
| `seo_keywords` | ✅ Created (dynamic) |
| `seo_sitemaps` | ✅ Created (dynamic) |
| `seo_pages` | ✅ Prisma schema (existing) |
| `seo_errors` | ✅ Prisma schema (existing) |
| `seo_backlinks` | ✅ Prisma schema (existing) |

### Admin Dashboard

- URL: `/admin/seo`
- Features: Date range selector (7/14/28/90 days), trend charts (clicks, impressions, CTR, position), top queries/pages tables, mobile/desktop/tablet breakdown, sitemap status, manual sync button

### Re-authentication

If the token expires, visit `/admin/seo` and click **"Google ile Yetkilendir"**. The OAuth flow will replace the expired token in `google_tokens`.

### Key Files

- `lib/search-console-sync.ts` — Sync service (fetches GSC API data, upserts into `seo_performance`)
- `app/api/search-console/sync/route.ts` — Sync API endpoint (POST to trigger, GET for status)
- `app/admin/seo/components/` — Dashboard UI components (PerformanceChart, SummaryCards, TopQueriesTable, TopPagesTable, DeviceBreakdown, SitemapStatus)
- `docs/search-console-setup.md` — Full setup documentation

## Linkler

- **Neon Console:** https://console.neon.tech
- **Airtable Base:** gul-tekin-muhendislik
- **Twitter:** @gul_tekin (Gül-Tekin account)
- **Site:** https://gul-tekinmuhendislik.com
