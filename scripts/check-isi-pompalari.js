const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== ISI POMPALARI KATEGORISI ===\n');

  const urunler = await sql`
    SELECT id, urun_adi, marka, kategori, slug, aktif, stokta
    FROM urunler
    WHERE kategori ILIKE '%Isı Pompaları%'
       OR kategori ILIKE '%Isi Pompasi%'
       OR kategori ILIKE '%ISI POMPASI%'
       OR urun_adi ILIKE '%ısı pompa%'
       OR urun_adi ILIKE '%isi pompa%'
    ORDER BY marka, urun_adi
  `;

  console.log(`Toplam Isı Pompası ürünü: ${urunler.length}\n`);

  // Markaya göre grupla
  const byMarka = {};
  urunler.forEach(u => {
    const m = u.marka || 'Diger';
    if (!byMarka[m]) byMarka[m] = [];
    byMarka[m].push(u);
  });

  Object.keys(byMarka).sort().forEach(marka => {
    console.log(`\n--- ${marka} (${byMarka[marka].length} ürün) ---`);
    byMarka[marka].forEach(u => {
      console.log(`  • ${u.urun_adi}`);
    });
  });

  console.log('\n=== ISI POMPALARI KATEGORILERI ===');
  const kategoriler = await sql`
    SELECT DISTINCT kategori, COUNT(*) as adet
    FROM urunler
    WHERE urun_adi ILIKE '%pompa%' OR urun_adi ILIKE '%pompas%'
    GROUP BY kategori
    ORDER BY kategori
  `;
  kategoriler.forEach(k => console.log(`  ${k.kategori}: ${k.adet}`));
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
