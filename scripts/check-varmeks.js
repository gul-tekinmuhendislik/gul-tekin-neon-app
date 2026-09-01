const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== VARMEKS URUNLERI ===\n');

  const urunler = await sql`
    SELECT id, urun_adi, marka, kategori, slug, aktif, anasayfa_goster, stokta
    FROM urunler
    WHERE marka ILIKE '%Varmeks%'
       OR marka ILIKE '%VARMEK%'
       OR urun_adi ILIKE '%Varmeks%'
    ORDER BY urun_adi
  `;

  console.log(`Toplam Varmeks urunu: ${urunler.length}\n`);
  urunler.forEach((u, i) => {
    console.log(`${i + 1}. ${u.urun_adi}`);
    console.log(`   ID: ${u.id}`);
    console.log(`   Marka: ${u.marka}`);
    console.log(`   Kategori: ${u.kategori}`);
    console.log(`   Slug: ${u.slug}`);
    console.log(`   Aktif: ${u.aktif} | Anasayfa: ${u.anasayfa_goster} | Stok: ${u.stokta}`);
    console.log('');
  });

  console.log('\n=== VARMEKS MARKASI ===');
  const marka = await sql`
    SELECT id, marka_adi, kategori, aktif, cloudinary_url
    FROM markalar
    WHERE marka_adi ILIKE '%Varmeks%'
       OR marka_adi ILIKE '%VARMEK%'
  `;
  marka.forEach(m => {
    console.log(`[${m.id}] ${m.marka_adi} | Aktif: ${m.aktif}`);
  });
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
