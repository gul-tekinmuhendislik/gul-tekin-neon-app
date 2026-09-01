const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== BAYLAN markasina ait urunler siliniyor ===\n');

  // Silme islemi - RETURNING ile silinen kayitlari goster
  const silinenler = await sql`
    DELETE FROM urunler
    WHERE marka ILIKE '%BAYLAN%'
    RETURNING id, urun_adi, marka, kategori, slug
  `;

  console.log(`✅ ${silinenler.length} urun silindi:\n`);
  silinenler.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.urun_adi}`);
    console.log(`     ID: ${u.id}`);
    console.log(`     Marka: ${u.marka}`);
    console.log(`     Kategori: ${u.kategori}`);
    console.log(`     Slug: ${u.slug}`);
    console.log('');
  });

  // Silme sonrasi kontrol
  console.log('\n=== KONTROL: BAYLAN markasi kalan urun sayisi ===');
  const kalan = await sql`
    SELECT COUNT(*) as count
    FROM urunler
    WHERE marka ILIKE '%BAYLAN%'
  `;
  console.log(`Kalan BAYLAN urun sayisi: ${kalan[0].count}`);

  // Marka kontrolu
  console.log('\n=== KONTROL: BAYLAN markasi markalar tablosunda var mi? ===');
  const markaKontrol = await sql`
    SELECT id, marka_adi, kategori
    FROM markalar
    WHERE marka_adi ILIKE '%BAYLAN%'
  `;
  if (markaKontrol.length > 0) {
    console.log('BAYLAN markasi markalar tablosunda mevcut:');
    markaKontrol.forEach(m => console.log(`  [${m.id}] ${m.marka_adi} | ${m.kategori}`));
    console.log('\nBu markayi da silmek ister misin? (ayri bir islem gerekecek)');
  } else {
    console.log('BAYLAN markasi markalar tablosunda bulunamadi.');
  }
}

main().catch(e => console.error('HATA:', e)).finally(() => process.exit(0));
