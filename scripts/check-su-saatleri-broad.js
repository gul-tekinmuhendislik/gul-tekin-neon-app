const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log("=== 'su' iceren tum urunler (ilk 50) ===");
  const urunler = await sql`
    SELECT id, urun_adi, marka, kategori, slug
    FROM urunler
    WHERE urun_adi ILIKE '%su%'
       OR kategori ILIKE '%su%'
    ORDER BY urun_adi
    LIMIT 50
  `;
  urunler.forEach(u => {
    console.log(`  [${u.id}] ${u.urun_adi} | Marka: ${u.marka} | Kat: ${u.kategori}`);
  });
  console.log('Toplam:', urunler.length);

  console.log("\n=== 'saat' iceren tum urunler (ilk 50) ===");
  const saatler = await sql`
    SELECT id, urun_adi, marka, kategori, slug
    FROM urunler
    WHERE urun_adi ILIKE '%saat%'
       OR kategori ILIKE '%saat%'
    ORDER BY urun_adi
    LIMIT 50
  `;
  saatler.forEach(u => {
    console.log(`  [${u.id}] ${u.urun_adi} | Marka: ${u.marka} | Kat: ${u.kategori}`);
  });
  console.log('Toplam:', saatler.length);

  console.log("\n=== Tum kategoriler (benzersiz) ===");
  const kategoriler = await sql`
    SELECT DISTINCT kategori, COUNT(*) as adet
    FROM urunler
    WHERE kategori IS NOT NULL AND kategori != ''
    GROUP BY kategori
    ORDER BY kategori
  `;
  kategoriler.forEach(k => {
    console.log(`  ${k.kategori}: ${k.adet} urun`);
  });
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
