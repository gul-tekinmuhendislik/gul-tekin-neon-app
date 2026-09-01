const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== VARMEKS URUNLERI - KATEGORI KONTROLU ===\n');

  const urunler = await sql`
    SELECT id, urun_adi, marka, kategori, slug
    FROM urunler
    WHERE marka = 'Varmeks'
    ORDER BY kategori, urun_adi
  `;

  // Kategorilere grupla
  const byKategori = {};
  urunler.forEach(u => {
    if (!byKategori[u.kategori]) byKategori[u.kategori] = [];
    byKategori[u.kategori].push(u);
  });

  Object.keys(byKategori).sort().forEach(k => {
    console.log(`\n--- ${k} (${byKategori[k].length} ürün) ---`);
    byKategori[k].forEach(u => {
      console.log(`  ${u.urun_adi}`);
    });
  });

  console.log('\n\n=== ISI POMPALARI KATEGORISINDEKI URUNLER ===');
  const isiPompasi = await sql`
    SELECT urun_adi, marka, kategori
    FROM urunler
    WHERE kategori = 'Isı Pompaları'
    ORDER BY marka, urun_adi
  `;
  isiPompasi.forEach(u => {
    console.log(`  ${u.marka} - ${u.urun_adi}`);
  });
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
