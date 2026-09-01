const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const products = await sql`
    SELECT id, urun_adi, slug, marka, kategori, fiyat, stokta
    FROM urunler
    WHERE aktif = true AND slug IS NOT NULL
    ORDER BY id DESC
    LIMIT 10
  `;

  console.log('Son 10 ürün:');
  products.forEach(p => {
    console.log(`ID: ${p.id} | ${p.urun_adi?.substring(0,40)} | Slug: ${p.slug} | Marka: ${p.marka} | Kategori: ${p.kategori}`);
  });

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
