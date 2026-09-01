const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log("=== 'Su Sayacı' kategorisindeki urunler ===");
  const suSayaci = await sql`
    SELECT id, urun_adi, marka, kategori, slug, aktif, cloudinary_url
    FROM urunler
    WHERE kategori ILIKE '%su sayac%'
       OR kategori ILIKE '%sayaç%'
    ORDER BY urun_adi
  `;
  suSayaci.forEach(u => {
    console.log(`  [${u.id}] ${u.urun_adi} | Marka: ${u.marka} | Kat: ${u.kategori} | Aktif: ${u.aktif}`);
  });
  console.log('Toplam Su Sayacı:', suSayaci.length);

  console.log("\n=== 'Su Sayaci' markasi var mi? ===");
  const markalar = await sql`
    SELECT id, marka_adi, kategori, logo_url, cloudinary_url
    FROM markalar
    WHERE marka_adi ILIKE '%sayaç%'
       OR marka_adi ILIKE '%su say%'
       OR kategori ILIKE '%sayaç%'
  `;
  markalar.forEach(m => {
    console.log(`  [${m.id}] ${m.marka_adi} | Kat: ${m.kategori}`);
  });
  console.log('Toplam marka:', markalar.length);

  console.log("\n=== Pis Su Pompası urunleri ===");
  const pisSu = await sql`
    SELECT id, urun_adi, marka, kategori, slug
    FROM urunler
    WHERE kategori ILIKE '%pis su%'
       OR urun_adi ILIKE '%pis su%'
    ORDER BY urun_adi
  `;
  pisSu.forEach(u => {
    console.log(`  [${u.id}] ${u.urun_adi} | Marka: ${u.marka} | Kat: ${u.kategori}`);
  });
  console.log('Toplam Pis Su Pompası:', pisSu.length);
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
