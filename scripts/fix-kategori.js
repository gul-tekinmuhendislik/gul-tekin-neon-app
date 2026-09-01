const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('=== KATEGORI DUZELTME ===\n');

  // 1. ALDEA 25-120 KW - Havuz değil normal ısı pompası
  console.log('1. ALDEA İnverter Monoblok Isı Pompası 25-120 KW');
  const fix1 = await sql`
    UPDATE urunler
    SET kategori = 'Isı Pompaları'
    WHERE urun_adi ILIKE '%ALDEA%25-120%'
    RETURNING id, urun_adi, kategori
  `;
  console.log(`   Güncellendi: ${fix1.length}`);
  fix1.forEach(u => console.log(`   → ${u.urun_adi} | ${u.kategori}`));

  // 2. Aldea Monoblok 11-18 KW - Havuz değil normal ısı pompası
  console.log('\n2. Aldea Monoblok Isı Pompası 11-18 KW');
  const fix2 = await sql`
    UPDATE urunler
    SET kategori = 'Isı Pompaları'
    WHERE urun_adi ILIKE '%Aldea%Monoblok%11-18%'
      AND marka ILIKE '%Aldea%'
    RETURNING id, urun_adi, kategori
  `;
  console.log(`   Güncellendi: ${fix2.length}`);
  fix2.forEach(u => console.log(`   → ${u.urun_adi} | ${u.kategori}`));

  // 3. Kontrol
  console.log('\n=== KONTROL ===');
  const isiPompasi = await sql`SELECT COUNT(*) as count FROM urunler WHERE kategori = 'Isı Pompaları'`;
  console.log(`Isı Pompaları kategorisindeki toplam ürün: ${isiPompasi[0].count}`);

  const aldeaIsiPompasi = await sql`
    SELECT urun_adi, kategori
    FROM urunler
    WHERE marka ILIKE '%Aldea%'
      AND (urun_adi ILIKE '%Isı Pompası%' OR urun_adi ILIKE '%Isi Pompasi%')
    ORDER BY urun_adi
  `;
  console.log('\nAldea Isı Pompası ürünleri:');
  aldeaIsiPompasi.forEach(u => {
    console.log(`  ${u.urun_adi} → ${u.kategori}`);
  });
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
