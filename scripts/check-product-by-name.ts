import { sql } from '../lib/db';

async function checkProduct() {
  try {
    console.log('Checking for 8kW inverter monoblok products...\n');

    const products = await sql`
      SELECT id, urun_adi, slug, marka, kategori, stokta, aktif
      FROM urunler
      WHERE (
        slug = 'varmeks-8-kw-inverter-monoblok-isi-pompasi'
        OR urun_adi ILIKE '%8 kw%inverter%monoblok%'
        OR urun_adi ILIKE '%8kw%inverter%monoblok%'
      )
      ORDER BY marka, urun_adi
    `;

    if (products.length === 0) {
      console.log('No products found matching the criteria.');
    } else {
      console.log(`Found ${products.length} product(s):\n`);
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.urun_adi}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Slug: ${product.slug}`);
        console.log(`   Marka: ${product.marka}`);
        console.log(`   Kategori: ${product.kategori}`);
        console.log(`   Stokta: ${product.stokta}`);
        console.log(`   Aktif: ${product.aktif}`);
        console.log(`   URL: /urunler/${product.slug}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkProduct();
