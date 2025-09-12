require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID_PROJELER = process.env.AIRTABLE_TABLE_ID_PROJELER || 'Projeler';

console.log('Airtable Konfigürasyonu:');
console.log('API Key:', AIRTABLE_API_KEY ? 'Mevcut' : 'YOK!');
console.log('Base ID:', AIRTABLE_BASE_ID || 'YOK!');
console.log('Table ID:', AIRTABLE_TABLE_ID_PROJELER);
console.log('-------------------\n');

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ AIRTABLE_API_KEY veya AIRTABLE_BASE_ID ayarlanmamış!');
  process.exit(1);
}

// Configure Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

const base = Airtable.base(AIRTABLE_BASE_ID);

async function fetchProjeler() {
  try {
    console.log('Airtable Projeler tablosuna bağlanılıyor...\n');
    
    const records = [];
    
    await base(AIRTABLE_TABLE_ID_PROJELER)
      .select({
        view: 'Grid view',
        maxRecords: 5, // Test için ilk 5 kayıt
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach((record) => {
          records.push({
            id: record.id,
            fields: record.fields,
          });
        });
        fetchNextPage();
      });
    
    console.log(`✅ ${records.length} proje bulundu!\n`);
    
    // İlk 3 projeyi detaylı göster
    records.slice(0, 3).forEach((record, index) => {
      console.log(`📋 Proje ${index + 1}:`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Adı: ${record.fields['Proje Adı'] || 'Belirtilmemiş'}`);
      console.log(`   Slug: ${record.fields['SEO:slug'] || 'Yok'}`);
      console.log(`   Mahalle: ${record.fields['Mahalle Adı'] || 'Belirtilmemiş'}`);
      console.log(`   İlçe: ${record.fields['İlçe Adı'] || 'Belirtilmemiş'}`);
      console.log(`   Açıklama: ${(record.fields['Açıklama'] || '').substring(0, 100)}...`);
      console.log(`   Resim Sayısı: ${record.fields['Resimler']?.length || 0}`);
      console.log(`   Ana Faaliyet: ${record.fields['Ana faaliyet Konusu']?.join(', ') || 'Yok'}`);
      console.log('-------------------\n');
    });
    
    // Tüm alan adlarını listele
    if (records.length > 0) {
      console.log('📊 Tablodaki tüm alan adları:');
      const allFields = new Set();
      records.forEach(record => {
        Object.keys(record.fields).forEach(field => allFields.add(field));
      });
      console.log(Array.from(allFields).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.statusCode) {
      console.error('   Status Code:', error.statusCode);
    }
    if (error.error) {
      console.error('   Error Details:', error.error);
    }
  }
}

fetchProjeler();