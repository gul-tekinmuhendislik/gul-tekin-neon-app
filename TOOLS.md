# TOOLS.md - Gül-Tekin Mühendislik Araçları

## Neon Database (PostgreSQL)

**Connection String:** `.env` içinde kaydedilmiş
```
DATABASE_URL=postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Endpoints:**
- **Pooled (Recommended):** `ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech`
- **Unpooled:** `ep-polished-frog-adaec7m0.c-2.us-east-1.aws.neon.tech`

**Önemli Tablolar:**
- `URUNLER` — 399 ürün
- `TWITTER_POSTS` — Twitter post history (kullanılacak)
- `SOCIAL_MEDIA_POSTS` — Multi-platform posts
- `HIZMETLER`, `MARKALAR`, `PROJELER_GUL_TEKIN`

**Sorgu Yardımcıları:**
```sql
-- Tüm tablolar
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Tablo yapısı
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'urunler';

-- Satır sayısı
SELECT COUNT(*) FROM urunler;
```

---

## Twitter Automation

**Account:** Gül-Tekin Mühendislik (gul_tekin)
**Script:** `post-daily.js` (Node.js + OAuth 1.0a)
**Zamanlama:** 15:00 her gün (Europe/Istanbul)
**Cron Job ID:** `3b703853-8883-4e03-824a-30c3b7f1f7be`

**Credentials Location:** `.env`
```
TWITTER_CONSUMER_KEY=...
TWITTER_CONSUMER_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...
```

---

## Airtable Sync

**Base:** gul-tekin-muhendislik
**Tables:**
- `tbltwImf85mTHEIwa` — Hizmetler
- `tbl2ViccDkm9YaVRz` — Markalar
- `tblY0QLZQJIsz30ge` — Projeler
- `tblfHv0Cao0h9lHsE` — Ürünler

**Sync Status:** Automatic (SYNCED_AT columns track)

---

## Cloudinary (Image CDN)

**Cloud Name:** dgfdk0l8j
**Usage:** Ürün, hizmet, proje resimleri
**Columns:** cloudinary_url, cloudinary_public_id

---

## Facebook Page

**Sayfa:** https://www.facebook.com/gultekinbodrum/
**Page ID:** 1469697623332513

## Instagram

**Sayfa:** https://www.instagram.com/gultekinmuhendislik48/
**Status:** ⚠️ Facebook sayfasına bağlı değil — bağlanınca API üzerinden post atılabilir

---

## Services in .env

✅ Google APIs (Gemini, Drive, GMB)
✅ Facebook Graph API
✅ Vercel AI Gateway
✅ OpenRouter, Groq, xAI
✅ FAL.ai (image generation)
✅ Hasura GraphQL
✅ Resend (email)

---

## Database Scripts

**Check Neon Status:**
```bash
cd /Users/ebartan/.openclaw/workspace-customer-gultekin
node check-neon.js
```

**Post Daily Tweet:**
```bash
node post-daily.js
```

**Insert Post to DB (soon):**
```bash
node insert-post.js
```
