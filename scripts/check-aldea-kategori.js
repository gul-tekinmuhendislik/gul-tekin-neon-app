const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== ALDEA URUNLERI - DETAYLI KATEGORI ===\n');

  const aldea = await sql`
    SELECT id, urun_adi, marka, kategori, slug
    FROM urunler
    WHERE marka ILIKE '%Aldea%'
    ORDER BY urun_adi
  `;

  aldea.forEach(u => {
    console.log(`  ${u.urun_adi}`);
    console.log(`     Kategori: "${u.kategori}"`);
    console.log('');
  });

  console.log('\n=== FARKLI KATEGORILER POMPA ICEREN ===');
  const pompaKategoriler = await sql`
    SELECT DISTINCT kategori, COUNT(*) as adet
    FROM urunler
    WHERE urun_adi ILIKE '%pompa%'
       OR urun_adi ILIKE '%pompas%'
    GROUP BY kategori
    ORDER BY kategori
  `;
  pompaKategoriler.forEach(k => {
    console.log(`  "${k.kategori}": ${k.adet} ürün`);
  });
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
