const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const posts = await sql`
    SELECT id, title, slug, status, image_url
    FROM generated_content
    WHERE slug LIKE 'varmeks%' OR slug LIKE 'neden-varmeks%'
    ORDER BY id
  `;

  console.log('Varmeks Blog Posts:');
  posts.forEach(p => {
    console.log(`ID: ${p.id} | ${p.title.substring(0,50)} | Status: ${p.status} | Image: ${p.image_url || 'YOK'}`);
  });

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
