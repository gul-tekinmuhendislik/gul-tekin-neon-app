import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Milas mahalleleri (nufusune.com kaynağından tam liste)
const milasMahalleler = [
  // Merkez mahalleler
  'Ahmetçavuş', 'Aliağa', 'Atatürk', 'Aydınlıkevler', 'Bahçelievler',
  'Burgaz', 'Cumhuriyet', 'Emek', 'Firuzpaşa', 'Gücekbaşı',
  'Gümüşlük', 'Güneş', 'Hacıabti', 'Hacıçorbacı', 'Hacıilyas',
  'Hisar', 'Hisarbaşı', 'İlbira', 'İsmetpaşa', 'Kavaklıdere',
  'Kocakışla', 'Orta', 'Şevketiye', 'Yalı', 'Yeni',

  // Kırsal mahalleler
  'Ağaçlıhüyük', 'Akçakaya', 'Akçalı', 'Akkovalık', 'Akyol',
  'Alaçam', 'Alatepe', 'Aslanyaka', 'Avşar', 'Bafa',
  'Bağdamları', 'Baharlı', 'Bahçe', 'Bahçeburun', 'Balcılar',
  'Bayır', 'Beçin', 'Beyciler', 'Boğaziçi', 'Bozalan',
  'Bozbük', 'Çakıralan', 'Çallı', 'Çamköy', 'Çamlıbelen',
  'Çamlıca', 'Çamlıyurt', 'Çamovalı', 'Çandır', 'Çınarlı',
  'Çiftlik', 'Çomakdağkızılağaç', 'Çökertme', 'Çukur', 'Damlıboğaz',
  'Danişment', 'Demirciler', 'Dere', 'Derince', 'Dibekdere',
  'Dörttepe', 'Eğridere', 'Ekinanbarı', 'Ekindere', 'Ekizköy',
  'Ekiztaş', 'Epçe', 'Etrenli', 'Fesleğen', 'Gökbel',
  'Gökçeler', 'Göldere', 'Gölyaka', 'Güllük', 'Güvercinlik',
  'Hacıköy', 'Hançalı', 'Hasıralar', 'Hayıtlı', 'Hidirlik',
  'Hıdırlar', 'İçme', 'İnköy', 'İsabey', 'İskele',
  'Kafaca', 'Kalem', 'Kalınağıl', 'Kamışlık', 'Kaplan',
  'Karaahmet', 'Karaaslan', 'Karacaağaç', 'Karacahisar', 'Karahüyük',
  'Karaköy', 'Karapınar', 'Karaveli', 'Kargıcak', 'Karıncalı',
  'Kazıkbeli', 'Kemerköy', 'Kırcağız', 'Kırıköy', 'Kıyıkışlacık',
  'Kızılyaka', 'Konak', 'Koruköy', 'Koru', 'Köseler',
  'Küçükkolpan', 'Küçüknarköy', 'Kuyudere', 'Meşelik', 'Narlıdere',
  'Oba', 'Orhanlı', 'Ovakışlacık', 'Ören', 'Özbükü',
  'Özdemir', 'Pınarcık', 'Sar', 'Savran', 'Selimiye',
  'Sinir', 'Sodra', 'Suludere', 'Şamlı', 'Şeyhler',
  'Taşlı', 'Tekeli', 'Topçular', 'Toprak', 'Tulumentaş',
  'Türkevleri', 'Uzundere', 'Yakaköy', 'Yassıbağ', 'Yavşan',
  'Yazır', 'Yeniköy', 'Yeşilbağcılar', 'Yoğunoluk', 'Yöney',
  'Yukarısoku', 'Yunus'
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

async function addMilasMahalleler() {
  try {
    const ilceId = 2; // Milas ID

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

    for (const mahalle of milasMahalleler) {
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
    console.log(`Toplam Milas mahalle sayısı: ${total[0].count}`);

  } catch (error) {
    console.error('Hata:', error);
  }
}

addMilasMahalleler();
