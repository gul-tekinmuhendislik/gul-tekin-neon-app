import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const menteseMahalleler = [
  'Orhaniye', 'Kötekli', 'Muslihittin', 'Emirbeyazıt', 'Karamehmet',
  'Düğerek', 'Bayır', 'Karşıyaka', 'Yeniköy', 'Yerkesik',
  'Yeşilyurt', 'Akçaova', 'Akkaya', 'Gülağzı', 'Şeyh',
  'Müştakbey', 'Camikebir', 'Yaraş', 'Kıran', 'Çaybükü',
  'Denizova', 'Taşlı', 'Salihpaşalar', 'Dokuzçam', 'Yörükoğlu',
  'Hacırüstem', 'Dağpınar', 'Gazeller', 'Esençay', 'Derinkuyu',
  'Algı', 'Yemişendere', 'Çamoluk', 'Kuyucak', 'Paşapınarı',
  'Çatakbağyaka', 'Günlüce', 'Balıbey', 'Meke', 'Kozağaç',
  'Dağdibi', 'Yenibağyaka', 'Fadıl', 'Çırpı', 'Karacaören',
  'Akyer', 'Çakmak', 'İkizce', 'Doğan', 'Muratlar',
  'Özlüce', 'Avcılar', 'Kuzluk', 'Kiramettin', 'Zeytin',
  'Göktepe', 'Sarnıç', 'Bozyer', 'Orta', 'Yenice',
  'Şenyayla', 'Tekağaç', 'Çiftlik', 'Kafaca', 'Kocamustafapaşa',
  'Ömerağa'
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

async function addMenteseMahalleler() {
  try {
    const ilceId = 4; // Menteşe ID

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

    for (const mahalle of menteseMahalleler) {
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
    console.log(`Toplam Menteşe mahalle sayısı: ${total[0].count}`);

  } catch (error) {
    console.error('Hata:', error);
  }
}

addMenteseMahalleler();
