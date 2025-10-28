import { sql } from '../lib/db';

async function check404Products() {
  console.log('Checking 404 product issues...\n');

  // Check for varmeks product
  const varmeksProducts = await sql`
    SELECT slug, urun_adi, marka, kategori, aktif
    FROM urunler
    WHERE slug = 'varmeks-isi-pompasi-12-kw' OR LOWER(urun_adi) LIKE '%varmeks%12%'
    ORDER BY urun_adi
  `;

  console.log(`Found ${varmeksProducts.length} products for 'varmeks-isi-pompasi-12-kw':`);
  if (varmeksProducts.length > 0) {
    varmeksProducts.forEach((p: any) => {
      console.log(`  - ${p.urun_adi}`);
      console.log(`    Slug: ${p.slug}`);
      console.log(`    Marka: ${p.marka}`);
      console.log(`    Kategori: ${p.kategori}`);
      console.log(`    Aktif: ${p.aktif}\n`);
    });
  } else {
    console.log('  No exact match found.\n');
  }

  // Search for similar varmeks products
  const similarProducts = await sql`
    SELECT slug, urun_adi, marka, kategori, aktif
    FROM urunler
    WHERE LOWER(marka) = 'varmeks' AND LOWER(urun_adi) LIKE '%12%kw%'
    ORDER BY urun_adi
    LIMIT 10
  `;

  console.log(`\nFound ${similarProducts.length} similar Varmeks 12kW products:`);
  similarProducts.forEach((p: any) => {
    console.log(`  - ${p.urun_adi} (${p.slug}, aktif: ${p.aktif})`);
  });

  // Check if there are any Varmeks heat pumps
  const varmeksHeatPumps = await sql`
    SELECT slug, urun_adi, kategori, aktif
    FROM urunler
    WHERE LOWER(marka) = 'varmeks' AND aktif = true
    ORDER BY urun_adi
    LIMIT 20
  `;

  console.log(`\n\nAll active Varmeks products (${varmeksHeatPumps.length}):`);
  varmeksHeatPumps.forEach((p: any) => {
    console.log(`  - ${p.urun_adi} (/${p.slug})`);
  });
}

check404Products()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
