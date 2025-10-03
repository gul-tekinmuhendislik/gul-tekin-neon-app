import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const bodrumMahalleler = [
  'Akçaalan', 'Akyarlar', 'Bahçelievler', 'Bahçeyaka', 'Bitez',
  'Cevat Şakir', 'Cumhuriyet', 'Çamarası', 'Çamlık', 'Çarşı',
  'Çırkan', 'Çiftlik', 'Çömlekçi', 'Dağbelen', 'Dereköy',
  'Dirmil', 'Eskiçeşme', 'Farilya', 'Geriş', 'Gökpınar',
  'Gölbaşı', 'Gölköy', 'Göltürkbükü', 'Gümbet', 'Gümüşlük',
  'Gündoğan', 'Gürece', 'Güvercinlik', 'İslamhaneleri', 'Karabağ',
  'Karaova', 'Kadıkalesi', 'Kemer', 'Kızılağaç', 'Konacık',
  'Koyunbaba', 'Kumbahçe', 'Kumköy', 'Küçükbük', 'Mazıköy',
  'Mumcular', 'Müskebi', 'Ortakent', 'Peksimet', 'Pınarlıbelen',
  'Sazköy', 'Tepecik', 'Torba', 'Turgutreis', 'Türkbükü',
  'Türkkuyusu', 'Yaka', 'Yalıçiftlik', 'Yalıkavak', 'Yeniköy',
  'Yokuşbaşı', 'Bağla', 'Bodrum'
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function addBodrumMahalleler() {
  try {
    const ilceId = 1; // Bodrum ID

    console.log('Mevcut mahalleleri kontrol ediyorum...\n');
    const existing = await sql`
      SELECT mahalle_adi FROM mahalleler WHERE ilce_id = ${ilceId}
    `;

    const existingNames = existing.map((m: any) =>
      m.mahalle_adi.replace(' MAHALLESİ', '').replace('İ', 'I').toUpperCase()
    );

    console.log(`Mevcut: ${existingNames.length} mahalle`);
    console.log('Eklenecek mahalleler:\n');

    let added = 0;

    for (const mahalle of bodrumMahalleler) {
      const normalizedName = mahalle.replace('İ', 'I').toUpperCase();

      if (!existingNames.includes(normalizedName)) {
        const mahalleAdi = mahalle + ' Mahallesi';
        const slug = slugify(mahalle + '-mahallesi');

        await sql`
          INSERT INTO mahalleler (ilce_id, mahalle_adi, slug, proje_sayisi, created_at, updated_at)
          VALUES (${ilceId}, ${mahalleAdi}, ${slug}, 0, NOW(), NOW())
        `;

        console.log(`✓ ${mahalleAdi}`);
        added++;
      }
    }

    console.log(`\n✅ ${added} yeni mahalle eklendi!`);

    const total = await sql`SELECT COUNT(*) as count FROM mahalleler WHERE ilce_id = ${ilceId}`;
    console.log(`Toplam Bodrum mahalle sayısı: ${total[0].count}`);

  } catch (error) {
    console.error('Hata:', error);
  }
}

addBodrumMahalleler();
