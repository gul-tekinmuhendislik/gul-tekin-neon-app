const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== MEVCUT BLOG YAZILARI - ISI POMPASI KONULARI ===\n');

  const posts = await sql`
    SELECT id, title, slug, meta_description, keywords, created_at
    FROM generated_content
    WHERE status = 'published'
      AND (
        title ILIKE '%ısı pompa%'
        OR title ILIKE '%isi pompa%'
        OR title ILIKE '%varmeks%'
        OR title ILIKE '%ısıtma%'
        OR title ILIKE '%soğutma%'
        OR title ILIKE '%enerji%'
        OR title ILIKE '%havuz%'
        OR content ILIKE '%ısı pompa%'
      )
    ORDER BY created_at DESC
    LIMIT 20
  `;

  posts.forEach(p => {
    console.log(`[${p.id}] ${p.title}`);
    console.log(`    Slug: ${p.slug}`);
    console.log(`    Tarih: ${p.created_at}`);
    console.log('');
  });

  console.log('\n=== ISI POMPASI KATEGORINDEKI TUM YAZILAR ===');
  const isiPompasi = await sql`
    SELECT id, title, slug
    FROM generated_content
    WHERE status = 'published'
      AND (title ILIKE '%ısı pompa%' OR title ILIKE '%isi pompa%' OR title ILIKE '%Varmeks%')
    ORDER BY created_at DESC
  `;
  console.log(`Toplam: ${isiPompasi.length} yazı`);
  isiPompasi.forEach(p => console.log(`  - ${p.title}`));

  console.log('\n=== POPULER KONULAR ===');
  const keywords = await sql`
    SELECT UNNEST(keywords) as keyword, COUNT(*) as count
    FROM generated_content
    WHERE status = 'published'
    GROUP BY keyword
    ORDER BY count DESC
    LIMIT 15
  `;
  keywords.forEach(k => console.log(`  ${k.keyword}: ${k.count} kez`));
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
