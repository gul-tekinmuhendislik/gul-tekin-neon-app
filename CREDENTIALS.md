# CREDENTIALS.md - Hizmet Entegrasyonları

**.env dosyasında kaydedilmiş tüm üçüncü taraf servisler**

---

## 1. 🗄️ Airtable (Data Sync)

**Status:** ✅ Aktif - Ürün/Hizmet/Marka/Proje sync

```
AIRTABLE_API_KEY=patuy8iuRGH77YBPX...
AIRTABLE_BASE_ID=appIfmedvKXQWOm15
```

**Synced Tables:**
- `AIRTABLE_TABLE_ID_URUNLER=tblfHv0Cao0h9lHsE` — Ürünler (399)
- `AIRTABLE_TABLE_ID_HIZMETLER=tbltwImf85mTHEIwa` — Hizmetler (13)
- `AIRTABLE_TABLE_ID_MARKALAR=tbl2ViccDkm9YaVRz` — Markalar (45)
- `AIRTABLE_TABLE_ID_PROJELER=tblY0QLZQJIsz30ge` — Projeler (236)

**Neon Integration:** `synced_at` columns track updates

---

## 2. 🖼️ Cloudinary (Image CDN)

**Status:** ✅ Aktif - Tüm resimlerin CDN'si

```
CLOUDINARY_CLOUD_NAME=dgfdk0l8j
CLOUDINARY_API_KEY=782682811169167
CLOUDINARY_API_SECRET=g0ojrhN_9uoubWmiVKz0f396KOo
CLOUDINARY_URL=cloudinary://782682811169167:g0ojrhN_9uoubWmiVKz0f396KOo@dgfdk0l8j
```

**Kullanım:**
- `cloudinary_url` — Optimized image URL
- `cloudinary_public_id` — Unique identifier
- Ürün, hizmet, proje resimleri
- Generated content images

**Bandwidth:** Aylık limit check → Cloudinary Console

---

## 3. 🤖 Google APIs

### a) Google Gemini (LLM)
**Status:** ✅ Aktif - AI content generation
```
GOOGLE_GEMINI_API_KEY=AIzaSyBX6KZsqulgdnTKvabZu2A6uNWPHNO1cw4
```

### b) Google Drive (File Storage)
**Status:** ✅ Aktif - Service Account
```
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=(base64 encoded)
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json
```

### c) Google Custom Search (Web Search)
**Status:** ✅ Aktif - Site search
```
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=c55f04e97b1a24e7d
GOOGLE_CLIENT_ID=770843146139-fdbnmbcprlgb24h0vf2tjlf5u5tgrjnn.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### d) Google My Business (Listing)
**Status:** ✅ Aktif - Local SEO
```
NEXT_PUBLIC_ENABLE_GMB=true
```

### e) Google Maps (Maps Integration)
**Status:** ✅ Aktif - Site maps
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCshlqWYpzXaBFScJoNlybl6FMlHA63Rbs
```

---

## 4. 📱 Facebook (Social)

**Status:** ✅ Aktif - Daily posts
```
FACEBOOK_PAGE_ID=1469697623332513
FACEBOOK_PAGE_ACCESS_TOKEN=EAALD8zKDUd8BPbGHZBqVkvkGOHHsZAF...
```

**Integration Points:**
- Daily product posts (15:00)
- `SOCIAL_MEDIA_POSTS` table tracking
- Engagement metrics logging

---

## 5. 🖼️ FAL.ai (Image Generation)

**Status:** ✅ Aktif - AI image generation
```
FAL_AI_KEY=ed631a12-69e2-4458-be03-c6f133b28ce3:709893c4a098151ed2e56ea25987e9eb
```

**Usage:**
- Alternative to DALL-E for product images
- `generated_images` table

---

## 6. 🚀 Vercel (Deployment)

**Status:** ✅ Aktif - Hosting + AI Gateway
```
VERCEL_OIDC_TOKEN=eyJhbGciOiJSUzI1NiIs...
NEXT_PUBLIC_SITE_URL=https://gul-tekinmuhendislik.com
```

---

## 7. 🔍 OpenRouter (Multi-LLM)

**Status:** ✅ Aktif - Alternative LLM provider
```
OPENROUTER_API_KEY=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
```

**Models Available:** GPT-4, Claude, Llama, etc.

---

## 8. ⚡ Groq (Fast LLM)

**Status:** ✅ Aktif - High-speed inference
```
GROQ_API_KEY=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
```

---

## 9. 🌟 xAI (Grok LLM)

**Status:** ✅ Aktif
```
XAI_API_KEY=xai-obRhg6QVoiAHBqL5WJB2ZR8KkB5V871GFUwYgDsrXAJq9cDhSZvD2YzAuD4yzweDAUCQ3ek7ud0NUst6
```

---

## 10. 🔗 Exa (Search)

**Status:** ✅ Aktif - Web research
```
EXA_API_KEY=90f1ee2c-26d0-4a47-a4af-18ae0dc6a009
```

---

## 11. 📊 Hasura (GraphQL API)

**Status:** ✅ Aktif - Database GraphQL layer
```
HASURA_PROJECT_ENDPOINT=https://powerful-lemur-86.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=Szq0Glqofgx12E9n3kl70x7S3cOBGhWgtTyOWzLCLINJPeRpMDAJ92drEEV7Dh4H
NEXT_PUBLIC_HASURA_PROJECT_ENDPOINT=https://powerful-lemur-86.hasura.app/v1/graphql
```

---

## 12. 🔔 Inngest (Workflows)

**Status:** ✅ Aktif - Event-driven workflows
```
INNGEST_EVENT_KEY=g8nH2Z5xTW1N7LIWvhrn0oO6nDKARqMRyrF21CRFo9x79vq0fKBZqVb8aPr61Lfz6kc6UKwNW_z8FRe2iCwQAg
INNGEST_SIGNING_KEY=signkey-prod-0daacebdb22e9ab56c934744809aaeb843573002d499a8437414f2d93880aadd
```

---

## 13. ✉️ Resend (Email)

**Status:** ✅ Aktif - Transactional emails
```
RESEND_API_KEY=re_RrRs7Q7P_EfEHaA1kXfGxamKFPwVtF5mL
RESEND_FROM_EMAIL=info@gul-tekinmuhendislik.com
```

**Usage:** Contact form emails, notifications

---

## 14. 🔐 Stack (Auth)

**Status:** ✅ Aktif - User authentication
```
NEXT_PUBLIC_STACK_PROJECT_ID=c285ed98-277e-4fc0-aa05-a50501327712
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_mk0x4w922f8a09t7qfaq1pwrdhc53k8z25ry33sx9cdbg
STACK_SECRET_SERVER_KEY=ssk_3368m2vze8hr2b198gwbgr8dw0d5jrn0wb1yw2zvpyj30
```

---

## 15. 🌐 Neon (PostgreSQL)

**Status:** ✅ Aktif - Primary database
```
DATABASE_URL=postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
PGHOST=ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech
PGUSER=neondb_owner
PGPASSWORD=npg_fjQXK6w3iWDP
PGDATABASE=neondb
```

---

## 🔐 Security Audit

| Service | Status | Expiry | Notes |
|---------|--------|--------|-------|
| Airtable | ✅ | — | API key long-lived |
| Cloudinary | ✅ | — | Rate limits monitored |
| Google | ✅ | — | Service account (no expiry) |
| Facebook | ✅ | ⚠️ Check | Page token may expire |
| FAL.ai | ✅ | — | Key pair format |
| Groq | ✅ | — | Long-lived |
| Hasura | ✅ | — | Admin secret strong |
| Neon | ✅ | — | Pooled + unpooled |
| **Twitter** | ❌ | **Expired** | **REGENERATE ASAP** |

---

## 📋 Checklist

- [x] Airtable — Connected & syncing
- [x] Cloudinary — Images stored
- [x] Google APIs — All services active
- [x] Facebook — Page token valid
- [x] FAL.ai — Image generation ready
- [x] Neon — Database healthy
- [ ] Twitter — Regenerate credentials (401 error)
- [x] All other services — Functional

---

## Tips

1. **Rotate credentials monthly** (except long-lived keys)
2. **Monitor API usage** on Airtable, Cloudinary, Google
3. **Test Facebook token** before posting
4. **Back up .env** to secure location (never git)
5. **Use Neon pooled endpoint** for web apps
6. **Check Hasura GraphQL playground:** https://powerful-lemur-86.hasura.app/console
