const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_fjQXK6w3iWDP@ep-polished-frog-adaec7m0-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log('========================================');
  console.log('VARMEKS VERİTABANI GÜNCELLEME');
  console.log('========================================\n');

  // ============================================
  // 1. EKSİK ÜRÜNLERİ EKLE (Varm Up 23kW, 28kW, 35kW)
  // ============================================
  console.log('📦 1. EKSİK VARM UP ÜRÜNLERİ EKLENİYOR...\n');

  const yeniUrunler = [
    {
      id: 'varmeks-varm-up-23kw-isi-pompasi',
      urun_adi: 'Varmeks VARM UP 23 kW Isı Pompası',
      marka: 'Varmeks',
      kategori: 'Isı Pompaları',
      slug: 'varmeks-varm-up-23kw-isi-pompasi',
      aciklama: 'Varm Up Serisi - R32 Monoblok Isı Pompası, 23 kW, DC Inverter, Wi-Fi, -30°C Çalışma',
      aktif: true,
      anasayfa_goster: false,
      stokta: true
    },
    {
      id: 'varmeks-varm-up-28kw-isi-pompasi',
      urun_adi: 'Varmeks VARM UP 28 kW Isı Pompası',
      marka: 'Varmeks',
      kategori: 'Isı Pompaları',
      slug: 'varmeks-varm-up-28kw-isi-pompasi',
      aciklama: 'Varm Up Serisi - R32 Monoblok Isı Pompası, 28 kW, DC Inverter, Wi-Fi, -30°C Çalışma',
      aktif: true,
      anasayfa_goster: false,
      stokta: true
    },
    {
      id: 'varmeks-varm-up-35kw-isi-pompasi',
      urun_adi: 'Varmeks VARM UP 35 kW Isı Pompası',
      marka: 'Varmeks',
      kategori: 'Isı Pompaları',
      slug: 'varmeks-varm-up-35kw-isi-pompasi',
      aciklama: 'Varm Up Serisi - R32 Monoblok Isı Pompası, 35 kW, DC Inverter, Wi-Fi, -30°C Çalışma',
      aktif: true,
      anasayfa_goster: false,
      stokta: true
    }
  ];

  for (const urun of yeniUrunler) {
    try {
      await sql`
        INSERT INTO urunler (id, urun_adi, marka, kategori, slug, aciklama, aktif, anasayfa_goster, stokta)
        VALUES (${urun.id}, ${urun.urun_adi}, ${urun.marka}, ${urun.kategori}, ${urun.slug}, ${urun.aciklama}, ${urun.aktif}, ${urun.anasayfa_goster}, ${urun.stokta})
      `;
      console.log(`  ✅ Eklendi: ${urun.urun_adi}`);
    } catch (e) {
      if (e.message.includes('unique')) {
        console.log(`  ⚠️ Zaten mevcut: ${urun.urun_adi}`);
      } else {
        console.log(`  ❌ Hata: ${urun.urun_adi} - ${e.message}`);
      }
    }
  }

  // ============================================
  // 2. FAZLA ÜRÜNLERİ SİL (Varm All 150L, Commercial Duo 180kW)
  // ============================================
  console.log('\n🗑️ 2. FAZLA ÜRÜNLER SİLİNİYOR...\n');

  // Varm All 150L sil
  const sil1 = await sql`
    DELETE FROM urunler
    WHERE urun_adi ILIKE '%Varm All%150L%'
       OR urun_adi ILIKE '%VARM ALL%150%'
    RETURNING id, urun_adi
  `;
  console.log(`  ✅ Silindi (Varm All 150L): ${sil1.length} ürün`);
  sil1.forEach(u => console.log(`     - ${u.urun_adi}`));

  // Commercial Duo 180kW sil
  const sil2 = await sql`
    DELETE FROM urunler
    WHERE urun_adi ILIKE '%Commercial%DUO%180%'
       OR urun_adi ILIKE '%COMMERCIAL%DUO%180%'
    RETURNING id, urun_adi
  `;
  console.log(`  ✅ Silindi (Commercial Duo 180kW): ${sil2.length} ürün`);
  sil2.forEach(u => console.log(`     - ${u.urun_adi}`));

  // ============================================
  // 3. MARKA İSİMLERİNİ DÜZELT (WARMEKS -> Varmeks)
  // ============================================
  console.log('\n✏️ 3. MARKA İSİMLERİ DÜZELTİLİYOR...\n');

  const markaFix = await sql`
    UPDATE urunler
    SET marka = 'Varmeks'
    WHERE marka ILIKE '%WARMEKS%'
       OR marka = 'Varmeks'
    RETURNING id, urun_adi, marka
  `;
  console.log(`  ✅ Güncellenen ürün sayısı: ${markaFix.length}`);

  // ============================================
  // 4. KATEGORİ İSİMLERİNİ DÜZELT
  // ============================================
  console.log('\n✏️ 4. KATEGORİ İSİMLERİ DÜZELTİLİYOR...\n');

  // Havuz ısı pompası kategorisini düzelt
  const kategoriFix1 = await sql`
    UPDATE urunler
    SET kategori = 'Havuz Isı Pompaları'
    WHERE kategori ILIKE '%havuz%ısı%pompa%'
       OR kategori ILIKE '%HAVUZ%ISI%POMPA%'
    RETURNING id, urun_adi, kategori
  `;
  console.log(`  ✅ Havuz kategorisi güncellendi: ${kategoriFix1.length} ürün`);

  // Solimpeks kategorisini Isı Pompaları yap (Commercial DUO için)
  const kategoriFix2 = await sql`
    UPDATE urunler
    SET kategori = 'Isı Pompaları'
    WHERE kategori ILIKE '%Solimpeks%'
    RETURNING id, urun_adi, kategori
  `;
  console.log(`  ✅ Solimpeks kategorisi güncellendi: ${kategoriFix2.length} ürün`);

  // ============================================
  // 5. DOĞRULAMA
  // ============================================
  console.log('\n========================================');
  console.log('📊 DOĞRULAMA');
  console.log('========================================\n');

  // Toplam Varmeks ürünü
  const toplam = await sql`SELECT COUNT(*) as count FROM urunler WHERE marka = 'Varmeks'`;
  console.log(`Toplam Varmeks ürünü: ${toplam[0].count}`);

  // Varm Up kontrol
  const varmUp = await sql`SELECT urun_adi FROM urunler WHERE urun_adi ILIKE '%Varm UP%' ORDER BY urun_adi`;
  console.log(`\nVarm Up Serisi (${varmUp.length} ürün):`);
  varmUp.forEach(u => console.log(`  - ${u.urun_adi}`));

  // Kategori dağılımı
  const kategoriler = await sql`
    SELECT kategori, COUNT(*) as adet
    FROM urunler
    WHERE marka = 'Varmeks'
    GROUP BY kategori
    ORDER BY kategori
  `;
  console.log('\nKategori Dağılımı:');
  kategoriler.forEach(k => console.log(`  ${k.kategori}: ${k.adet}`));

  // Marka ismi kontrol
  const markalar = await sql`
    SELECT DISTINCT marka
    FROM urunler
    WHERE marka ILIKE '%varm%' OR marka ILIKE '%VARM%'
  `;
  console.log('\nMarka İsimleri:');
  markalar.forEach(m => console.log(`  - ${m.marka}`));

  console.log('\n========================================');
  console.log('✅ İŞLEM TAMAMLANDI');
  console.log('========================================');
}

main().catch(e => console.error('HATA:', e)).finally(() => process.exit(0));
