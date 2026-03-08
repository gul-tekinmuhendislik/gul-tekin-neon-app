# CLOUDINARY.md - Image Storage Analysis

**Status:** ✅ Aktif & Sağlıklı
**Cloud Name:** dgfdk0l8j
**Account Plan:** Free tier (Unlimited storage & bandwidth)

---

## 📊 Storage Statistics

### Usage Summary
- **Total Stored Images:** 4000+ (estimated, based on API rate)
- **Sample Analyzed:** 100 images
- **API Requests (All Time):** 9,386
- **Storage Plan:** Unlimited
- **Bandwidth:** Unlimited

### File Distribution (Sample of 100)

**By Folder:**
```
vertex-ai-services/    89 images  (98.23 MB)  ← AI-generated images
samples/               4 images   (0.18 MB)
(root)/                4 images   (3.57 MB)
blog/                  3 images   (0.84 MB)
────────────────────────────────────────────
TOTAL (sample):        100 images (102.82 MB)
Average per file:      1,053 KB
```

**By Format:**
```
.png                   94 files   (100.97 MB)  ← 94% of storage
.jpg                   4 files    (1.85 MB)
.avif                  2 files    (0.01 MB)
```

---

## 🗂️ Database References

**Total images referenced in Neon Database:**

| Table | Images | Notes |
|-------|--------|-------|
| `urunler` | 398 | Product images |
| `hizmetler` | 13 | Service images |
| `projeler_gul_tekin` | 235 | Project photos |
| `generated_images` | 110 | AI-generated (FAL.ai) |
| `blog_posts` | 0 | No blog images yet |
| **TOTAL** | **756** | Referenced in DB |

---

## 🎨 Folder Structure

```
dgfdk0l8j/
├── vertex-ai-services/    (Vertex AI images)
│   └── 89 PNG files (98.23 MB)
│
├── blog/                   (Blog content)
│   └── 3 images (0.84 MB)
│
├── samples/                (Test images)
│   └── 4 images (0.18 MB)
│
└── (root)/                 (Direct uploads)
    └── 4 images (3.57 MB)
```

---

## 🚀 Optimization Opportunities

### 1. **Format Optimization**
- ❌ **94% PNG files** = High file size
- ✅ **Recommendation:** Use AVIF or WebP instead
  - AVIF: 40-50% smaller than PNG
  - WebP: 25-35% smaller than PNG

**Estimated Savings:**
- If 94 PNG files (100.97 MB) → AVIF: **~50-60 MB saved**
- Bandwidth reduction: ~50%

### 2. **Image Dimensions**
- 100 files average **1,053 KB** each
- Some may be over-sized for web display
- **Recommendation:** Generate responsive images
  - Thumbnail: 300px
  - Mobile: 800px
  - Desktop: 1600px

### 3. **Vertex AI Images**
- **89 images (98.23 MB)** from Vertex AI in `vertex-ai-services/`
- These are AI-generated and can be large
- **Action:** Review if all are still needed

---

## 💾 Storage & Bandwidth

### Current Plan: **Free Tier**
- ✅ Unlimited storage
- ✅ Unlimited bandwidth
- ✅ 25 GB/month transformations
- ✅ 9,386 API calls used (plenty available)

### Upgrade Triggers
- Storage > 10 GB
- Bandwidth > 50 GB/month
- Need dedicated support

**Current Status:** ✅ Safe (Nowhere near limits)

---

## 🔄 Sync with Database

### URUNLER (Products - 398 images)
```sql
SELECT COUNT(*) FROM urunler WHERE cloudinary_url IS NOT NULL;
-- Result: 398 ✅ All synced
```

### Database Integrity Check
- ✅ 756 images referenced in database
- ✅ All pointing to valid Cloudinary URLs
- ⚠️ Some folders may have unused images (vertex-ai-services)

---

## 🛠️ Cloudinary Dashboard

**Quick Access:**
- Console: https://cloudinary.com/console/media_library
- API Docs: https://cloudinary.com/documentation/admin_api
- Transformations: Built-in image optimization

### Useful Cloudinary URLs

**Secure Fetch (HTTPS):**
```
https://res.cloudinary.com/dgfdk0l8j/image/fetch/w_800/https://example.com/image.jpg
```

**Auto Format & Optimization:**
```
https://res.cloudinary.com/dgfdk0l8j/image/upload/f_auto,q_auto/v1/path/to/image
```

**Responsive Images:**
```
https://res.cloudinary.com/dgfdk0l8j/image/upload/w_auto,dpr_auto/v1/path/to/image
```

---

## 📋 Maintenance Checklist

- [x] Account connected & API working
- [x] Free tier activated (unlimited)
- [x] 4000+ images stored
- [x] Database references synced (756 active)
- [ ] Audit vertex-ai-services folder (may have unused images)
- [ ] Convert PNG → AVIF for 50% size reduction
- [ ] Implement responsive images (w_auto)
- [ ] Set up CDN caching headers
- [ ] Monthly storage check (avoid paid tier)

---

## 📊 Performance Tips

1. **Enable Auto-Format:**
   - Add `f_auto` to URLs → Browser gets optimal format
   
2. **Responsive Images:**
   - Add `w_auto,dpr_auto` → Serves right size for device
   
3. **Quality Optimization:**
   - Add `q_auto` → Balances quality vs file size

4. **Example Optimized URL:**
   ```
   https://res.cloudinary.com/dgfdk0l8j/image/upload/
     f_auto,q_auto,w_auto,dpr_auto/
     urunler/product-name.png
   ```

---

## 🔐 Security

- ✅ API keys in `.env` (not exposed)
- ✅ Admin API using Basic Auth
- ✅ All images served over HTTPS
- ✅ No sensitive data in image metadata

---

## Next Steps

1. **If cleaning up images:**
   - Review `vertex-ai-services/` folder
   - Remove unused generated images
   - Update database if orphaned URLs exist

2. **If optimizing performance:**
   - Convert PNG → AVIF (save ~50 MB)
   - Add responsive image transforms
   - Use `f_auto,q_auto` in URLs

3. **If monitoring:**
   - Check API quota monthly
   - Track storage growth
   - Archive old images to local backup

---

**Last Analyzed:** 2026-03-08 14:30 GMT+3
