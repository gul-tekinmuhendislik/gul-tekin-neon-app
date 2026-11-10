# CREDENTIALS.md - Hizmet Entegrasyonları

**Üçüncü taraf servis yapılandırmaları; gizli değerler repoda tutulmaz.**

---

## Airtable

Airtable sync has been retired; application data is served from Neon. Do not store Airtable credentials in this repository.

## 2. 🖼️ Cloudinary (Image CDN)

**Status:** ✅ Aktif - Tüm resimlerin CDN'si

```text
Secret values are managed outside this repository.
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
```text
Secret values are managed outside this repository.
```

### b) Google Drive (File Storage)
**Status:** ✅ Aktif - Service Account
```text
Secret values are managed outside this repository.
```

### c) Google Custom Search (Web Search)
**Status:** ✅ Aktif - Site search
```text
Secret values are managed outside this repository.
```

### d) Google My Business (Listing)
**Status:** ✅ Aktif - Local SEO
```text
Secret values are managed outside this repository.
```

### e) Google Maps (Maps Integration)
**Status:** ✅ Aktif - Site maps
```text
Secret values are managed outside this repository.
```

---

## 4. 📱 Facebook (Social)

**Status:** ✅ Aktif - Daily posts
```text
Secret values are managed outside this repository.
```

**Integration Points:**
- Daily product posts (15:00)
- `SOCIAL_MEDIA_POSTS` table tracking
- Engagement metrics logging

---

## 5. 🖼️ FAL.ai (Image Generation)

**Status:** ✅ Aktif - AI image generation
```text
Secret values are managed outside this repository.
```

**Usage:**
- Alternative to DALL-E for product images
- `generated_images` table

---

## 6. 🚀 Vercel (Deployment)

**Status:** ✅ Aktif - Hosting + AI Gateway
```text
Secret values are managed outside this repository.
```

---

## 7. 🔍 OpenRouter (Multi-LLM)

**Status:** ✅ Aktif - Alternative LLM provider
```text
Secret values are managed outside this repository.
```

**Models Available:** GPT-4, Claude, Llama, etc.

---

## 8. ⚡ Groq (Fast LLM)

**Status:** ✅ Aktif - High-speed inference
```text
Secret values are managed outside this repository.
```

---

## 9. 🌟 xAI (Grok LLM)

**Status:** ✅ Aktif
```text
Secret values are managed outside this repository.
```

---

## 10. 🔗 Exa (Search)

**Status:** ✅ Aktif - Web research
```text
Secret values are managed outside this repository.
```

---

## 11. 📊 Hasura (GraphQL API)

**Status:** ✅ Aktif - Database GraphQL layer
```text
Secret values are managed outside this repository.
```

---

## 12. 🔔 Inngest (Workflows)

**Status:** ✅ Aktif - Event-driven workflows
```text
Secret values are managed outside this repository.
```

---

## 13. ✉️ Resend (Email)

**Status:** ✅ Aktif - Transactional emails
```text
Secret values are managed outside this repository.
```

**Usage:** Contact form emails, notifications

---

## 14. 🔐 Stack (Auth)

**Status:** ✅ Aktif - User authentication
```text
Secret values are managed outside this repository.
```

---

## 15. 🌐 Neon (PostgreSQL)

**Status:** ✅ Aktif - Primary database
```text
Secret values are managed outside this repository.
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
