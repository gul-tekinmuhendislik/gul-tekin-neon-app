require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID_PROJELER = process.env.AIRTABLE_TABLE_ID_PROJELER || 'Projeler';

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ AIRTABLE_API_KEY veya AIRTABLE_BASE_ID ayarlanmamış!');
  process.exit(1);
}

// Configure Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

const base = Airtable.base(AIRTABLE_BASE_ID);

async function fetchAllProjeler() {
  try {
    console.log('🔄 Airtable Projeler tablosundaki TÜM kayıtlar getiriliyor...\n');
    
    const records = [];
    
    await base(AIRTABLE_TABLE_ID_PROJELER)
      .select({
        view: 'Grid view'
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
    
    console.log(`✅ Toplam ${records.length} proje bulundu!\n`);
    console.log('='*60);
    
    // Tüm projeleri listele
    records.forEach((record, index) => {
      console.log(`\n📋 PROJE #${index + 1}`);
      console.log('-'.repeat(40));
      console.log(`ID: ${record.id}`);
      console.log(`Proje Adı: ${record.fields['Proje Adı'] || 'Belirtilmemiş'}`);
      console.log(`SEO Slug: ${record.fields['SEO:slug'] || 'Yok'}`);
      console.log(`Mahalle: ${record.fields['Mahalle Adı'] || 'Belirtilmemiş'}`);
      console.log(`İlçe: ${record.fields['İlçe Adı'] || 'Belirtilmemiş'}`);
      console.log(`Başlangıç: ${record.fields['Proje Başlangıç Tarihi'] || 'Belirtilmemiş'}`);
      console.log(`Bitiş: ${record.fields['Proje Bitiş Tarihi'] || 'Belirtilmemiş'}`);
      console.log(`Yılı: ${record.fields['Proje Yılı'] || 'Belirtilmemiş'}`);
      console.log(`Ana Faaliyet: ${record.fields['Ana faaliyet Konusu'] || 'Yok'}`);
      console.log(`Resim Sayısı: ${record.fields['Resimler']?.length || 0}`);
      
      // İlk resmin URL'sini göster
      if (record.fields['Resimler']?.length > 0) {
        console.log(`İlk Resim URL: ${record.fields['Resimler'][0].url.substring(0, 80)}...`);
      }
      
      // Açıklamanın ilk 150 karakterini göster
      if (record.fields['Açıklama']) {
        console.log(`Açıklama: ${record.fields['Açıklama'].substring(0, 150)}...`);
      }
    });
    
    console.log('\n' + '='*60);
    console.log('\n📊 ÖZET İSTATİSTİKLER:');
    console.log('-'.repeat(40));
    
    // İlçelere göre dağılım
    const ilceCount = {};
    records.forEach(r => {
      const ilce = r.fields['İlçe Adı'] || 'Belirtilmemiş';
      ilceCount[ilce] = (ilceCount[ilce] || 0) + 1;
    });
    
    console.log('\nİlçelere Göre Dağılım:');
    Object.entries(ilceCount).forEach(([ilce, count]) => {
      console.log(`  ${ilce}: ${count} proje`);
    });
    
    // Yıllara göre dağılım
    const yilCount = {};
    records.forEach(r => {
      const yil = r.fields['Proje Yılı'] || 'Belirtilmemiş';
      yilCount[yil] = (yilCount[yil] || 0) + 1;
    });
    
    console.log('\nYıllara Göre Dağılım:');
    Object.entries(yilCount).sort().forEach(([yil, count]) => {
      console.log(`  ${yil}: ${count} proje`);
    });
    
    // Resim durumu
    const resimliProjeler = records.filter(r => r.fields['Resimler']?.length > 0).length;
    console.log(`\nResim Durumu:`);
    console.log(`  Resimli: ${resimliProjeler} proje`);
    console.log(`  Resimsiz: ${records.length - resimliProjeler} proje`);
    
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

fetchAllProjeler();