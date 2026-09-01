const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const products = await sql`
    SELECT id, urun_adi, cloudinary_url, gorsel_url, fiyat
    FROM urunler
    WHERE aktif = true AND slug IS NOT NULL
    LIMIT 10
  `;

  console.log('Ürün resim ve fiyat durumu:');
  products.forEach(p => {
    const hasImage = p.cloudinary_url || p.gorsel_url;
    console.log(`${p.urun_adi?.substring(0,40)}`);
    console.log(`  Resim: ${hasImage ? 'VAR' : 'YOK'} | Fiyat: ${p.fiyat ? p.fiyat + ' TL' : 'YOK'}`);
  });

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
