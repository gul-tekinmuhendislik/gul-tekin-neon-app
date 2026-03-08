# BLOG.md - Blog Sistemi & Yapısı

**Status:** ✅ Kurulu & Hazır (1 test post var)
**Last Updated:** 2026-03-08 14:35 GMT+3

---

## 📊 Hızlı Özet

| Metrik | Değer | Status |
|--------|-------|--------|
| **Total Posts** | 1 | ⏳ Başlangıç |
| **Published** | 1 | ✅ |
| **Drafts** | 0 | — |
| **With Images** | 0 | ⚠️ |
| **Total Views** | 0 | — |
| **Avg Quality** | 60/100 | ⚠️ |

---

## 🗂️ BLOG_POSTS Tablo Yapısı

### 35 Sütun (5 Kategori)

```sql
blog_posts (
  -- PRIMARY KEY
  id: INTEGER (AUTO),
  
  -- CONTENT
  title: VARCHAR (NOT NULL),
  slug: VARCHAR (NOT NULL) → URL slug,
  content: TEXT (NOT NULL) → Ana içerik,
  summary: TEXT → Kısa özet,
  
  -- IMAGES
  image_url: TEXT,
  cloudinary_url: TEXT,
  cloudinary_public_id: TEXT,
  
  -- METADATA
  category: VARCHAR,
  tags: ARRAY,
  author: VARCHAR,
  status: VARCHAR = 'draft',
  featured: BOOLEAN = false,
  content_language: TEXT = 'tr',
  
  -- SEO
  seo_title: VARCHAR,
  seo_description: VARCHAR,
  seo_keywords: ARRAY,
  
  -- CONTENT QUALITY
  word_count: INTEGER,
  read_time: INTEGER,
  reading_level: TEXT,
  content_quality_score: INTEGER (0-100),
  headings_count: INTEGER,
  images_count: INTEGER,
  links_count: INTEGER,
  content_structure: JSONB,
  
  -- AI ANALYSIS
  ai_generated_tags: ARRAY,
  last_ai_analysis_at: TIMESTAMP,
  
  -- ENGAGEMENT
  view_count: INTEGER = 0,
  like_count: INTEGER = 0,
  comment_count: INTEGER = 0,
  share_count: INTEGER = 0,
  
  -- TIMESTAMPS
  created_at: TIMESTAMP (default CURRENT_TIMESTAMP),
  updated_at: TIMESTAMP (default CURRENT_TIMESTAMP),
  published_at: TIMESTAMP,
  last_viewed_at: TIMESTAMP
)
```

---

## 📝 Sütunlar Detaylı

### Content Fields
| Sütun | Tipi | Örnek | Açıklama |
|-------|------|-------|----------|
| **title** | VARCHAR | "Güneş Enerjisi Sistemleri..." | Blog başlığı |
| **slug** | VARCHAR | "gunes-enerjisi-sistemleri..." | URL-friendly identifier |
| **content** | TEXT | "Lorem ipsum..." | Ana içerik (Markdown/HTML) |
| **summary** | TEXT | "Kısa özet..." | 1-2 satırlık açıklama |

### Image Fields
| Sütun | Tipi | Kullanım |
|-------|------|----------|
| **image_url** | TEXT | Orijinal kaynakta resim URL'si |
| **cloudinary_url** | TEXT | Cloudinary CDN URL (optimize edilmiş) |
| **cloudinary_public_id** | TEXT | Cloudinary'de referans ID |

**Durum:** 0/1 post resim yok (⚠️ eklemek öneriliyor)

### Metadata Fields
| Sütun | Tipi | Örnek | Default |
|-------|------|-------|---------|
| **category** | VARCHAR | "Yenilenebilir Enerji" | — |
| **tags** | ARRAY | ['enerji', 'güneş', 'sürdürülebilir'] | — |
| **author** | VARCHAR | "John Doe" | — |
| **status** | VARCHAR | 'draft' / 'published' / 'archived' | 'draft' |
| **featured** | BOOLEAN | true / false | false |
| **content_language** | TEXT | 'tr' / 'en' | 'tr' |

### SEO Fields
| Sütun | Maksimum | Açıklama |
|-------|----------|----------|
| **seo_title** | 60 char | Google title tag |
| **seo_description** | 160 char | Google meta description |
| **seo_keywords** | ARRAY | Anahtar kelimeler |

### Content Quality Fields
| Sütun | Tipi | Örnek | Açıklama |
|-------|------|-------|----------|
| **word_count** | INTEGER | 300 | Kelime sayısı |
| **read_time** | INTEGER | 2 | Dakika cinsinden okuma süresi |
| **reading_level** | TEXT | "B1 / Beginner" | Zorluk seviyesi |
| **content_quality_score** | INTEGER | 60 | Kalite puanı (0-100) |
| **headings_count** | INTEGER | 5 | H1, H2, H3 sayısı |
| **images_count** | INTEGER | 3 | Gömülü resim sayısı |
| **links_count** | INTEGER | 8 | İç/dış link sayısı |
| **content_structure** | JSONB | {...} | Yapı analizi |

**Not:** read_time otomatik hesaplanabilir: `word_count / 200`

### Engagement Fields
| Sütun | Varsayılan | Açıklama |
|-------|-----------|----------|
| **view_count** | 0 | Sayfa ziyareti |
| **like_count** | 0 | Beğenme |
| **comment_count** | 0 | Yorum |
| **share_count** | 0 | Sosyal paylaşım |

**Durum:** Tüm metrikler 0 (henüz etkileşim yok)

### AI Analysis Fields
| Sütun | Tipi | Açıklama |
|-------|------|----------|
| **ai_generated_tags** | ARRAY | Yapay zeka tarafından önerilen etiketler |
| **last_ai_analysis_at** | TIMESTAMP | Son AI analiz tarihi |

### Timestamp Fields
| Sütun | Açıklama |
|-------|----------|
| **created_at** | Yazı oluşturma tarihi |
| **updated_at** | Son düzenleme tarihi |
| **published_at** | Yayınlama tarihi |
| **last_viewed_at** | Son ziyaret tarihi |

---

## 📊 Mevcut Blog Post Örneği

```
ID: 1
Title: Güneş Enerjisi Sistemleri: Sürdürülebilir Geleceğe Yatırım
Slug: gunes-enerjisi-sistemleri-surdurulebilir-gelecege-yatirim

Status: published
Category: Yenilenebilir Enerji
Author: Anonymous (boş)
Featured: false

Content: 300 words
Read Time: ? (hesaplanmamış)
Quality Score: 60/100
Language: tr

SEO:
  - seo_title: (boş)
  - seo_description: (boş)
  - seo_keywords: (boş)

Image:
  - image_url: (boş)
  - cloudinary_url: (boş)
  - cloudinary_public_id: (boş)

Engagement:
  - Views: 0
  - Likes: 0
  - Comments: 0
  - Shares: 0

Created: 28.10.2025
Published: ? (published_at null)
```

---

## 🔄 Blog Workflow (Önerilen)

### 1. Draft Oluştur
```sql
INSERT INTO blog_posts 
(title, slug, content, status, author, category, content_language)
VALUES 
(
  'Blog başlığı',
  'blog-basligi-slug',
  'İçerik metni...',
  'draft',
  'Yazar Adı',
  'Kategori',
  'tr'
);
```

### 2. İçerik Ekle & SEO Optimizasyonu
```sql
UPDATE blog_posts
SET 
  summary = 'Kısa özet...',
  seo_title = 'SEO başlığı (60 char)',
  seo_description = 'Meta açıklama (160 char)',
  seo_keywords = ARRAY['anahtar1', 'anahtar2', 'anahtar3'],
  tags = ARRAY['tag1', 'tag2'],
  word_count = 450,
  read_time = CEILING(word_count::DECIMAL / 200),
  content_quality_score = 75
WHERE id = 1;
```

### 3. Resim Ekle
```sql
UPDATE blog_posts
SET 
  image_url = 'orijinal_url',
  cloudinary_url = 'https://res.cloudinary.com/...',
  cloudinary_public_id = 'blog/post-1',
  images_count = 2
WHERE id = 1;
```

### 4. Yayınla
```sql
UPDATE blog_posts
SET 
  status = 'published',
  published_at = NOW(),
  featured = true  -- Opsiyonel
WHERE id = 1;
```

### 5. Sosyal Medya Paylaşımı
```sql
INSERT INTO social_media_posts 
(content_id, platform, post_data, status)
VALUES
(1, 'twitter', '{"text": "..."}', 'pending'),
(1, 'facebook', '{"message": "..."}', 'pending');
```

---

## 🛠️ Önerilen Özellikleri

### Eksik Ama Gerekli
- [ ] **Form/CMS:** Blog yazısı oluşturma arayüzü
- [ ] **Auto-slug:** Başlıktan otomatik slug üretimi
- [ ] **Auto-read_time:** Sözcük sayısından okuma süresi
- [ ] **Content Quality Analysis:** AI-powered kalite analizi
- [ ] **Featured Image:** Lightbox / gallery desteği

### Gelişmiş Özellikler
- [ ] **Comments System:** Yorum tablosu ve yönetimi
- [ ] **Related Posts:** ML-based "benzer yazılar" önerisi
- [ ] **View Tracking:** Google Analytics entegrasyonu
- [ ] **Scheduled Publishing:** Yazı yayınlama zamanlaması
- [ ] **Draft Collaboration:** Beraber yazı yazma
- [ ] **Content Calendar:** Yazı takvimi

### AI/Automation
- [ ] **Auto-Tags:** AI tarafından etiket üretimi
- [ ] **Content Structure Analysis:** Markdown → JSONB parsing
- [ ] **SEO Suggestions:** Başlık/açıklama önerileri
- [ ] **Summary Generation:** Otomatik özet üretimi
- [ ] **Readability Check:** Okunabilirlik analizi

---

## 📋 SQL Query Örnekleri

### Tüm Yayınlanmış Yazılar
```sql
SELECT id, title, category, view_count, created_at
FROM blog_posts
WHERE status = 'published'
ORDER BY published_at DESC;
```

### En Çok Okunan Yazılar
```sql
SELECT id, title, view_count, like_count
FROM blog_posts
WHERE status = 'published'
ORDER BY view_count DESC
LIMIT 10;
```

### Kategoriye Göre Yazı Sayısı
```sql
SELECT category, COUNT(*) as post_count
FROM blog_posts
WHERE status = 'published'
GROUP BY category
ORDER BY post_count DESC;
```

### Taglere Göre Ara
```sql
SELECT title, tags
FROM blog_posts
WHERE 'enerji' = ANY(tags)
AND status = 'published';
```

### Kalitesi Düşük Yazılar (60 altı)
```sql
SELECT id, title, content_quality_score
FROM blog_posts
WHERE content_quality_score < 60
OR content_quality_score IS NULL;
```

### SEO Eksik Yazılar
```sql
SELECT id, title
FROM blog_posts
WHERE status = 'published'
AND (seo_title IS NULL OR seo_description IS NULL);
```

### Resim Olmayan Yazılar
```sql
SELECT id, title
FROM blog_posts
WHERE status = 'published'
AND cloudinary_url IS NULL;
```

---

## 🔗 İlişkiler

```
BLOG_POSTS
├─ cloudinary (image_url/cloudinary_url)
│  └─ Cloudinary CDN (storing images)
│
├─ social_media_posts (content_id)
│  └─ Otomatik Twitter/Facebook paylaşımı
│
├─ seo_pages (tracking blog URLs)
│  └─ SEO monitoring
│
└─ generated_content (? potentially)
   └─ AI-generated yazı önerileri
```

---

## 📊 İstatistikler (Current)

```
Total Posts:         1
Published:          1
Drafts:             0
Featured:           0
Average Quality:    60/100
With Images:        0 (0%)

Total Views:        0
Total Likes:        0
Total Comments:     0
Total Shares:       0

Categories:         1 (Yenilenebilir Enerji)
Languages:          1 (Turkish)
```

---

## 🎯 Gelecek Planı

### Phase 1: CMS (Hafta 1-2)
- [ ] Blog post creation form
- [ ] Auto slug generation
- [ ] Image upload + Cloudinary integration

### Phase 2: Features (Hafta 3-4)
- [ ] SEO optimization hints
- [ ] Content quality analysis
- [ ] Auto social sharing

### Phase 3: Advanced (Hafta 5-6)
- [ ] Comments system
- [ ] Related posts
- [ ] Blog archive/calendar
- [ ] Google Analytics tracking

### Phase 4: AI (Hafta 7+)
- [ ] Auto-tag generation
- [ ] SEO recommendations
- [ ] Content structure analysis
- [ ] Readability scoring

---

## 📝 Notes

1. **Status Değerleri:** 'draft' | 'published' | 'archived'
2. **Read Time Formül:** word_count / 200 (dakika)
3. **Quality Score:** 0-100 (AI tarafından hesaplanmalı)
4. **Default Language:** Turkish (tr)
5. **Auto-timestamps:** created_at, updated_at otomatik

---

## ✅ Checklist for New Blog Post

- [ ] Title (max 100 char)
- [ ] Slug (unique, URL-safe)
- [ ] Content (300+ words recommended)
- [ ] Summary (1-2 sentences)
- [ ] Category
- [ ] Tags (3-5)
- [ ] Author
- [ ] SEO Title (50-60 char)
- [ ] SEO Description (150-160 char)
- [ ] SEO Keywords (5-10)
- [ ] Feature Image (Cloudinary)
- [ ] Content Quality Score (validate)
- [ ] Status → publish
- [ ] Social Share → schedule

---

**Last Analyzed:** 2026-03-08 14:35 GMT+3
