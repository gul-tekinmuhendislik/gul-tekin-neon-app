const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  // Varmeks ürünlerini ve keyword'leri al
  const products = await sql`
    SELECT id, urun_adi, slug, marka, kategori, etiketler
    FROM urunler
    WHERE aktif = true
      AND (marka ILIKE '%Varmek%' OR urun_adi ILIKE '%Varmek%')
    ORDER BY urun_adi
  `;

  console.log(`${products.length} Varmeks ürünü:\n`);
  products.forEach(p => {
    console.log(`ID: ${p.id}`);
    console.log(`Ürün: ${p.urun_adi}`);
    console.log(`Slug: ${p.slug}`);
    console.log(`Etiketler: ${p.etiketler?.join(', ') || 'YOK'}`);
    console.log('---');
  });

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
