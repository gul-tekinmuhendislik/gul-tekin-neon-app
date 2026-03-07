import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function checkBlog(id: number) {
  const blogs = await sql`
    SELECT id, topic, title, slug, meta_title, meta_description, keywords, updated_at
    FROM generated_content WHERE id = ${id}
  `;
  
  console.log('📝 Blog ID:', id);
  console.log('---');
  console.log('Konu:', blogs[0].topic);
  console.log('Başlık:', blogs[0].title);
  console.log('Slug:', blogs[0].slug);
  console.log('Meta Title:', blogs[0].meta_title);
  console.log('Meta Description:', blogs[0].meta_description);
  console.log('Keywords:', blogs[0].keywords);
  console.log('Updated At:', blogs[0].updated_at);
}

checkBlog(131);

