#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('Blog Yapisi - Neon DB Analizi');
console.log('='.repeat(60) + '\n');

(async () => {
  try {
    await client.connect();
    console.log('[OK] Neon Database baglantisi kuruldu\n');

    // 1. Blog table schema
    console.log('Blog Posts Tablo Yapisi:\n');
    const schema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'blog_posts'
      ORDER BY ordinal_position
    `);

    console.log('  Tum Sutunlar:\n');
    schema.rows.forEach((row, i) => {
      const nullable = row.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
      const defaultVal = row.column_default ? ` = ${row.column_default}` : '';
      const idx = String(i + 1).padStart(2, ' ');
      console.log(`  ${idx}. ${row.column_name.padEnd(30)} ${row.data_type.padEnd(20)} ${nullable}${defaultVal}`);
    });

    // 2. Row count
    console.log('\n\nBlog Post Sayisi:\n');
    const countRes = await client.query('SELECT COUNT(*) as cnt FROM blog_posts');
    const count = countRes.rows[0].cnt;
    console.log(`  Total: ${count} blog post\n`);

    // 3. Detailed analysis by column group
    console.log('Sutun Kategorileri:\n');
    console.log('  === CONTENT FIELDS ===');
    console.log('  - title (VARCHAR) → Blog baslik');
    console.log('  - slug (VARCHAR) → URL slug');
    console.log('  - content (TEXT) → Ana icerik (Markdown/HTML)');
    console.log('  - summary (TEXT) → Kisa aciklama\n');

    console.log('  === IMAGE FIELDS ===');
    console.log('  - image_url (TEXT) → Original image');
    console.log('  - cloudinary_url (TEXT) → CDN image URL');
    console.log('  - cloudinary_public_id (TEXT) → Cloudinary ID\n');

    console.log('  === SEO FIELDS ===');
    console.log('  - seo_title (VARCHAR) → SEO title tag');
    console.log('  - seo_description (VARCHAR) → Meta description');
    console.log('  - seo_keywords (ARRAY) → Anahtar kelimeler\n');

    console.log('  === CONTENT QUALITY FIELDS ===');
    console.log('  - read_time (INTEGER) → Okuma suresi (dakika)');
    console.log('  - word_count (INTEGER) → Kelime sayisi');
    console.log('  - reading_level (TEXT) → Okuma seviyesi');
    console.log('  - content_quality_score (INTEGER) → Kalite skoru (0-100)');
    console.log('  - headings_count (INTEGER) → Baslik sayisi');
    console.log('  - images_count (INTEGER) → Resim sayisi');
    console.log('  - links_count (INTEGER) → Link sayisi\n');

    console.log('  === ENGAGEMENT FIELDS ===');
    console.log('  - view_count (INTEGER) → Ziyaret sayisi');
    console.log('  - like_count (INTEGER) → Begenme sayisi');
    console.log('  - comment_count (INTEGER) → Yorum sayisi');
    console.log('  - share_count (INTEGER) → Paylasim sayisi\n');

    console.log('  === METADATA FIELDS ===');
    console.log('  - category (VARCHAR) → Blog kategorisi');
    console.log('  - tags (ARRAY) → Tagler');
    console.log('  - author (VARCHAR) → Yazar');
    console.log('  - status (VARCHAR) → draft/published/archived');
    console.log('  - featured (BOOLEAN) → Ana sayfa go sterimi\n');

    console.log('  === AI ANALYSIS FIELDS ===');
    console.log('  - ai_generated_tags (ARRAY) → AI tarafından uretilen');
    console.log('  - content_language (TEXT) → Dil');
    console.log('  - content_structure (JSONB) → Yapisi');
    console.log('  - last_ai_analysis_at (TIMESTAMP) → Son analiz\n');

    console.log('  === TIMING FIELDS ===');
    console.log('  - created_at (TIMESTAMP) → Olusturma tarihi');
    console.log('  - updated_at (TIMESTAMP) → Guncelleme tarihi');
    console.log('  - published_at (TIMESTAMP) → Yayinlama tarihi');
    console.log('  - last_viewed_at (TIMESTAMP) → Son ziyaret\n');

    // 4. Display current blog posts (if any)
    if (count > 0) {
      console.log('\nMevcut Blog Postlari:\n');
      const posts = await client.query(`
        SELECT 
          id, title, slug, status, featured, view_count,
          word_count, read_time, content_quality_score,
          created_at, published_at, author, category
        FROM blog_posts
        ORDER BY created_at DESC
      `);

      posts.rows.forEach((post, i) => {
        console.log(`  ${i + 1}. ${post.title}`);
        console.log(`     Slug: ${post.slug}`);
        console.log(`     Author: ${post.author || 'Anonymous'}`);
        console.log(`     Status: ${post.status || 'draft'}`);
        console.log(`     Featured: ${post.featured ? 'EVET' : 'HAYIR'}`);
        console.log(`     Category: ${post.category || 'Uncategorized'}`);
        console.log(`     Views: ${post.view_count || 0} | Likes: ? | Comments: ?`);
        console.log(`     Words: ${post.word_count || '?'} | Read time: ${post.read_time || '?'} min`);
        console.log(`     Quality Score: ${post.content_quality_score || 'N/A'}/100`);
        console.log(`     Created: ${new Date(post.created_at).toLocaleDateString('tr-TR')}`);
        if (post.published_at) {
          console.log(`     Published: ${new Date(post.published_at).toLocaleDateString('tr-TR')}`);
        }
        console.log();
      });
    } else {
      console.log('\n[!] Henuz blog post yoktur\n');
    }

    // 5. Content stats
    console.log('\nUygulanabilir Istatistikler:\n');
    const statsRes = await client.query(`
      SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_posts,
        COUNT(CASE WHEN cloudinary_url IS NOT NULL THEN 1 END) as with_image,
        COALESCE(AVG(word_count), 0)::INT as avg_word_count,
        COALESCE(AVG(read_time), 0)::INT as avg_read_time,
        COALESCE(AVG(content_quality_score), 0)::INT as avg_quality_score,
        COALESCE(SUM(view_count), 0)::BIGINT as total_views,
        COALESCE(SUM(like_count), 0)::BIGINT as total_likes,
        COALESCE(SUM(comment_count), 0)::BIGINT as total_comments
      FROM blog_posts
    `);

    const stats = statsRes.rows[0];
    console.log(`  Total Posts: ${stats.total_posts}`);
    console.log(`  Published: ${stats.published}`);
    console.log(`  Drafts: ${stats.drafts}`);
    console.log(`  Featured: ${stats.featured_posts}`);
    console.log(`  With Images: ${stats.with_image}\n`);
    console.log(`  Average Word Count: ${stats.avg_word_count} words`);
    console.log(`  Average Read Time: ${stats.avg_read_time} minutes`);
    console.log(`  Average Quality Score: ${stats.avg_quality_score}/100\n`);
    console.log(`  Total Views: ${stats.total_views}`);
    console.log(`  Total Likes: ${stats.total_likes}`);
    console.log(`  Total Comments: ${stats.total_comments}\n`);

    // 6. Category distribution
    if (count > 0) {
      console.log('Kategori Dagilimi:\n');
      const catRes = await client.query(`
        SELECT 
          category, COUNT(*) as cnt,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published
        FROM blog_posts
        GROUP BY category
        ORDER BY cnt DESC
      `);

      catRes.rows.forEach(row => {
        console.log(`  - ${row.category || 'Uncategorized'}: ${row.cnt} post (${row.published} published)`);
      });
    }

    // 7. Database relationships
    console.log('\n\nBlog Post Iliskileri:\n');
    console.log('  blog_posts → cloudinary (image_url)');
    console.log('  blog_posts → generated_content (? potentially)');
    console.log('  blog_posts → social_media_posts (content distribution)');
    console.log('  blog_posts → seo_pages (SEO tracking)\n');

    // 8. Recommended workflow
    console.log('Onerilendigi Blog Workflow:\n');
    console.log('  1. Create draft (status = "draft")');
    console.log('  2. Add content (title, content, summary)');
    console.log('  3. Upload image to Cloudinary → Add cloudinary_url');
    console.log('  4. Add metadata (author, category, tags)');
    console.log('  5. Optimize SEO (seo_title, seo_description, seo_keywords)');
    console.log('  6. Set featured flag if needed');
    console.log('  7. Publish (status = "published", published_at = NOW())');
    console.log('  8. System auto-calculates (word_count, read_time, quality_score)');
    console.log('  9. Share to social media via social_media_posts\n');

    // 9. Improvement suggestions
    console.log('Gelistirme Onerileri:\n');
    console.log('  [ ] Blog post creation form (CMS)');
    console.log('  [ ] Auto-generate slug from title');
    console.log('  [ ] Auto-calculate read_time from word_count');
    console.log('  [ ] Auto-generate SEO tags from content');
    console.log('  [ ] Content quality analysis (ML)');
    console.log('  [ ] Auto-share published posts to social_media_posts');
    console.log('  [ ] View tracking (Google Analytics integration)');
    console.log('  [ ] Comment system (comments table)');
    console.log('  [ ] Related posts (ML recommendation)\n');

    console.log('Analiz tamamlandi!\n');

    await client.end();

  } catch (err) {
    console.error('HATA:', err.message);
    process.exit(1);
  }
})();
