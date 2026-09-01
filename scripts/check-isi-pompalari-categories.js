const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== ISI POMPALASI OLAN TUM KATEGORILER ===\n');

  // Isı Pompası geçen tüm kategoriler
  const kategoriler = await sql`
    SELECT DISTINCT kategori, COUNT(*) as adet
    FROM urunler
    WHERE urun_adi ILIKE '%pompa%'
       OR urun_adi ILIKE '%pompas%'
       OR kategori ILIKE '%pompa%'
       OR kategori ILIKE '%ısı%'
       OR kategori ILIKE '%isi%'
    GROUP BY kategori
    ORDER BY kategori
  `;

  kategoriler.forEach(k => {
    console.log(`  "${k.kategori}" (${k.adet} ürün)`);
  });

  console.log('\n=== EXACT MATCH TEST ===');
  const exact = await sql`
    SELECT COUNT(*) as count
    FROM urunler
    WHERE kategori = 'Isı Pompaları'
  `;
  console.log(`kategori = 'Isı Pompaları': ${exact[0].count} ürün`);

  console.log('\n=== ILIKE MATCH TEST ===');
  const ilike = await sql`
    SELECT COUNT(*) as count
    FROM urunler
    WHERE kategori ILIKE '%Isı Pompaları%'
  `;
  console.log(`kategori ILIKE '%Isı Pompaları%': ${ilike[0].count} ürün`);

  console.log('\n=== TUM ISI POMPASI OLAN URUNLER ===');
  const tumIsiPompalari = await sql`
    SELECT id, urun_adi, marka, kategori
    FROM urunler
    WHERE urun_adi ILIKE '%ısı pompa%'
       OR urun_adi ILIKE '%isi pompa%'
       OR urun_adi ILIKE '%Isı Pompası%'
       OR kategori = 'Isı Pompaları'
    ORDER BY marka, urun_adi
  `;
  console.log(`Toplam Isı Pompası ürünü: ${tumIsiPompalari.length}`);
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
