# NEON.md - Database Reference

**Neon Console:** https://console.neon.tech
**Project:** Gül-Tekin Mühendislik
**Database:** neondb (PostgreSQL 15)

---

## Connection Details

```
Host:     ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech
User:     neondb_owner
Password: npg_fjQXK6w3iWDP
Database: neondb
SSL:      require
```

---

## Tables by Category

### 📦 Products & Inventory
| Table | Rows | Primary Key | Notes |
|-------|------|-------------|-------|
| `urunler` | 399 | id (text) | Ürün kataloğu, anasayfa gösterimi |
| `markalar` | 45 | id (text) | Marka bilgileri, yetkili servis |
| `hizmetler` | 13 | id (text) | Hizmet tanımları |
| `hizmet_lokasyonlari` | 13 | id | Hizmet verildiği yerler |
| `mahalleler` | 603 | id | Proje mahallelerim |

### 📸 Visual Content
| Table | Rows | Notes |
|-------|------|-------|
| `projeler_gul_tekin` | 236 | Tamamlanan projeler + galeri |
| `vertex_images` | 3442 | Vertex AI generated images |
| `generated_images` | 110 | DALL-E/FAL.ai generated |
| `generated_content` | 130 | AI-generated text content |
| `blog_posts` | 1 | Blog yazıları |

### 🐦 Social Media
| Table | Rows | Key Fields |
|-------|------|------------|
| `twitter_posts` | 0 | tweet_id, content, posted_at, engagement |
| `social_media_posts` | 192 | platform, post_id, post_data, status |
| `social_tokens` | 1 | platform, access_token, expires_at |
| `twitter_tokens` | 0 | user_id, username, access_token |

### 📧 Messages & Logs
| Table | Rows | Purpose |
|-------|------|---------|
| `contact_messages` | 29 | İletişim formu gönderileri |
| `event_logs` | 111 | Sistem olayları |
| `token_refresh_logs` | 1 | Token yenileme history |

### 🎨 Design & Configuration
| Table | Rows | Purpose |
|-------|------|---------|
| `color_schemes` | 10 | Renk şemaları |
| `visual_elements` | 126 | Tasarım öğeleri |
| `style_presets` | 42 | Stil presetsları |
| `composition_rules` | 30 | Görsel komposisyon kuralları |
| `regional_themes` | 28 | Bölgesel tema tanımları |
| `negative_prompts` | 7 | AI negatif promptları |

### 🔍 SEO & Search
| Table | Rows | Purpose |
|-------|------|---------|
| `search_results` | 598 | Arama sonuçları cache |
| `seo_pages` | 0 | Page audit bilgileri |
| `seo_errors` | 0 | SEO hataları |
| `seo_backlinks` | 0 | Backlink tracking |

### 🔐 Auth & Tokens
| Table | Rows | Purpose |
|-------|------|---------|
| `google_tokens` | 2 | Google API tokens |
| `social_tokens` | 1 | Platform OAuth tokens |

### 🌐 Misc
| Table | Rows | Purpose |
|-------|------|---------|
| `navigation_menu` | 11 | Site menüsü |
| `sites_domain` | 16 | Domain yönetimi |

---

## Common Queries

### Get Latest Products
```sql
SELECT urun_adi, fiyat, stokta, cloudinary_url 
FROM urunler 
WHERE aktif = true 
ORDER BY updated_at DESC 
LIMIT 10;
```

### Get Random Product (for daily post)
```sql
SELECT urun_adi, kategori, marka 
FROM urunler 
WHERE aktif = true 
ORDER BY RANDOM() 
LIMIT 1;
```

### Check Post History (Last 30 days)
```sql
SELECT content, posted_at, status 
FROM twitter_posts 
WHERE posted_at > NOW() - INTERVAL '30 days' 
ORDER BY posted_at DESC;
```

### Insert New Twitter Post
```sql
INSERT INTO twitter_posts (tweet_id, content, posted_at, status)
VALUES ('1234567890', 'Post content here', NOW(), 'posted');
```

### Check Social Media Engagement
```sql
SELECT platform, COUNT(*) as post_count, 
       AVG((engagement_metrics->>'likes')::int) as avg_likes
FROM social_media_posts 
WHERE posted_at > NOW() - INTERVAL '7 days'
GROUP BY platform;
```

### List All Synced Products (from Airtable)
```sql
SELECT urun_adi, marka, synced_at 
FROM urunler 
WHERE synced_at IS NOT NULL 
ORDER BY synced_at DESC;
```

---

## Maintenance

### Check Database Size
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitor Connections
```sql
SELECT datname, usename, count(*) 
FROM pg_stat_activity 
GROUP BY datname, usename;
```

### Check Index Health
```sql
SELECT * FROM pg_stat_user_indexes 
WHERE idx_scan = 0;
```

---

## Synced Tables (from Airtable)

- `urunler` — Products (399 rows)
- `markalar` — Brands (45 rows)
- `hizmetler` — Services (13 rows)
- `projeler_gul_tekin` — Projects (236 rows)

**Sync Field:** `synced_at` — Last update timestamp

---

## Tips

1. **Always use SSL** for connections (sslmode=require)
2. **Use pooled endpoint** for web apps, unpooled for scripts
3. **Monitor token expiry** in social_tokens table
4. **Keep TWITTER_POSTS table** for audit trail
5. **Backup regularly** — export via Neon Console
