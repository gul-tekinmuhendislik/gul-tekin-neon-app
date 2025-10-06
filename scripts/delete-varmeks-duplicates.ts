import { sql } from '../lib/db';

async function deleteVarmeksDuplicates() {
  try {
    console.log('Finding VARMEKS products under SOLİMPEKS brand...\n');

    // First, list all VARMEKS products under Solimpeks brand
    const varmeksProducts = await sql`
      SELECT id, urun_adi, slug, marka, kategori
      FROM urunler
      WHERE marka = 'SOLİMPEKS'
        AND urun_adi ILIKE 'VARMEKS%'
        AND aktif = true
      ORDER BY urun_adi
    `;

    if (varmeksProducts.length === 0) {
      console.log('No VARMEKS products found under SOLİMPEKS brand.');
      return;
    }

    console.log(`Found ${varmeksProducts.length} VARMEKS product(s) under SOLİMPEKS brand:\n`);
    varmeksProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.urun_adi}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Kategori: ${product.kategori}`);
      console.log('');
    });

    console.log('\nDeleting these products...\n');

    // Delete the products
    const result = await sql`
      DELETE FROM urunler
      WHERE marka = 'SOLİMPEKS'
        AND urun_adi ILIKE 'VARMEKS%'
        AND aktif = true
      RETURNING id, urun_adi
    `;

    console.log(`✅ Successfully deleted ${result.length} product(s):\n`);
    result.forEach((product, index) => {
      console.log(`${index + 1}. ${product.urun_adi} (ID: ${product.id})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

deleteVarmeksDuplicates();
