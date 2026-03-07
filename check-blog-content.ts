import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function getBlogContents() {
  const blogs = await sql`
    SELECT id, topic, title, slug, content, meta_title, meta_description, keywords, status, created_at, updated_at, published_at
    FROM generated_content
    WHERE status = 'published'
    ORDER BY id DESC
    LIMIT 10
  `;
  
  console.log('📝 Blog İçerikleri:');
  console.log('='.repeat(80));
  
  for (const blog of blogs) {
    console.log(`\n📌 ID: ${blog.id}`);
    console.log(`   Konu: ${blog.topic}`);
    console.log(`   Başlık: ${blog.title}`);
    console.log(`   Slug: ${blog.slug}`);
    console.log(`   Meta Title: ${blog.meta_title || 'Yok'}`);
    console.log(`   Meta Desc: ${blog.meta_description ? blog.meta_description.substring(0, 80) + '...' : 'Yok'}`);
    console.log(`   Keywords: ${blog.keywords ? blog.keywords.join(', ') : 'Yok'}`);
    console.log(`   Created: ${blog.created_at}`);
    console.log(`   Updated: ${blog.updated_at}`);
    console.log(`   Published: ${blog.published_at}`);
    console.log(`   ---`);
    console.log(`   İçerik Özeti: ${blog.content.substring(0, 200)}...`);
    console.log('='.repeat(80));
  }
  
  return blogs;
}

getBlogContents();

