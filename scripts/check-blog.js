const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== BLOG VERITABANI ANALIZI ===\n');

  // Blog posts tablosu
  console.log('--- blog_posts tablosu ---');
  const blogPosts = await sql`
    SELECT id, title, slug, status, published_at, view_count, created_at
    FROM blog_posts
    ORDER BY created_at DESC
    LIMIT 10
  `;
  console.log(`blog_posts kayıt sayısı: ${blogPosts.length}`);
  blogPosts.forEach(b => {
    console.log(`  [${b.id}] ${b.title} | ${b.status} | ${b.created_at}`);
  });

  // Generated content tablosu
  console.log('\n--- generated_content tablosu ---');
  const genContent = await sql`
    SELECT id, topic, title, slug, status, published_at, image_url, created_at
    FROM generated_content
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const genCount = await sql`SELECT COUNT(*) as count FROM generated_content`;
  console.log(`generated_content toplam: ${genCount[0].count}`);
  genContent.forEach(g => {
    const img = g.image_url ? '🖼️' : '❌';
    console.log(`  [${g.id}] ${g.title || g.topic} | ${g.status} | ${img} | ${g.created_at}`);
  });

  // Status dağılımı
  console.log('\n--- Status Dağılımı ---');
  const statusDist = await sql`
    SELECT status, COUNT(*) as count
    FROM generated_content
    GROUP BY status
  `;
  statusDist.forEach(s => console.log(`  ${s.status}: ${s.count}`));

  // Blog API kontrol
  console.log('\n--- Blog API ---');
  try {
    const res = await fetch('http://localhost:3000/api/blog?page=1&limit=9');
    if (res.ok) {
      const data = await res.json();
      console.log(`API yanıtı: ${data.posts?.length || 0} post, ${data.pagination?.totalPages || 0} sayfa`);
    } else {
      console.log(`API hatası: ${res.status}`);
    }
  } catch (e) {
    console.log('API çalışmıyor (server aktif değil)');
  }
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
