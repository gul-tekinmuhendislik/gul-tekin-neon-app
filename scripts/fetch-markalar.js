const Airtable = require('airtable');

// Airtable configuration - using the provided credentials
const AIRTABLE_API_KEY = 'patuy8iuRGH77YBPX.3c3e6842eb2eb2587584a57779382ca17aaf2881e216b8df818c2386ca3ac1bb';
const AIRTABLE_BASE_ID = 'appIfmedvKXQWOm15';
const AIRTABLE_TABLE_ID_MARKALAR = 'tbl2ViccDkm9YaVRz';

// Configure Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

// Get base instance
const base = Airtable.base(AIRTABLE_BASE_ID);

// Function to format data in table format
function formatAsTable(records) {
  console.log('\n=== MARKALAR TABLOSU ===\n');
  
  // Headers
  const headers = ['No', 'Marka Adı', 'Slug', 'Email', 'URL', 'Website', 'Kategori', 'Y.Servis', 'Aktif', 'Sıralama'];
  console.log(headers.join(' | '));
  console.log(headers.map(() => '---').join(' | '));
  
  // Rows
  records.forEach((record, index) => {
    const fields = record.fields || {};
    const row = [
      (index + 1).toString().padStart(2, '0'),
      (fields.Name || 'N/A').substring(0, 20),
      (fields.Slug || 'N/A').substring(0, 15),
      (fields.Email || 'N/A').substring(0, 25),
      (fields.URL || 'N/A').substring(0, 20),
      (fields.Website || 'N/A').substring(0, 20),
      (fields.Category || 'N/A').substring(0, 15),
      fields.AuthorizedService ? 'Evet' : 'Hayır',
      fields.Active !== false ? 'Evet' : 'Hayır',
      fields.Order || 'N/A'
    ];
    console.log(row.join(' | '));
  });
  
  console.log(`\nToplam ${records.length} marka bulundu.\n`);
}

// Function to show detailed information
function showDetailedInfo(records) {
  console.log('\n=== DETAYLI BİLGİLER ===\n');
  
  records.forEach((record, index) => {
    const fields = record.fields || {};
    console.log(`${index + 1}. MARKA (ID: ${record.id})`);
    console.log(`   Marka Adı: ${fields.Name || 'Belirtilmemiş'}`);
    console.log(`   Slug: ${fields.Slug || 'Belirtilmemiş'}`);
    console.log(`   Email: ${fields.Email || 'Belirtilmemiş'}`);
    console.log(`   URL: ${fields.URL || 'Belirtilmemiş'}`);
    console.log(`   Website: ${fields.Website || 'Belirtilmemiş'}`);
    console.log(`   Kategori: ${fields.Category || 'Belirtilmemiş'}`);
    console.log(`   Yetkili Servis: ${fields.AuthorizedService ? 'Evet' : 'Hayır'}`);
    console.log(`   Aktif: ${fields.Active !== false ? 'Evet' : 'Hayır'}`);
    console.log(`   Sıralama: ${fields.Order || 'Belirtilmemiş'}`);
    if (fields.Notes) {
      console.log(`   Notlar: ${fields.Notes}`);
    }
    console.log('   ---');
  });
}

// Main function to fetch and display data
async function fetchMarkalar() {
  try {
    console.log('Airtable\'dan markalar getiriliyor...');
    console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
    console.log(`Table ID: ${AIRTABLE_TABLE_ID_MARKALAR}`);
    
    const records = [];
    
    await base(AIRTABLE_TABLE_ID_MARKALAR)
      .select({
        view: "Grid view", // Default view
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          records.push({
            id: record.id,
            fields: record.fields,
          });
        });
        fetchNextPage();
      });
    
    if (records.length === 0) {
      console.log('Hiç marka bulunamadı.');
      return;
    }
    
    // Sort by Order field, then by Name
    records.sort((a, b) => {
      const orderA = a.fields.Order || 999;
      const orderB = b.fields.Order || 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const nameA = a.fields.Name || '';
      const nameB = b.fields.Name || '';
      return nameA.localeCompare(nameB, 'tr');
    });
    
    // Display results
    formatAsTable(records);
    showDetailedInfo(records);
    
    // Show statistics
    const activeCount = records.filter(r => r.fields.Active !== false).length;
    const authorizedServiceCount = records.filter(r => r.fields.AuthorizedService).length;
    const categoriesSet = new Set(records.map(r => r.fields.Category).filter(Boolean));
    
    console.log('\n=== İSTATİSTİKLER ===');
    console.log(`Toplam Marka Sayısı: ${records.length}`);
    console.log(`Aktif Markalar: ${activeCount}`);
    console.log(`Yetkili Servis Olan: ${authorizedServiceCount}`);
    console.log(`Farklı Kategori Sayısı: ${categoriesSet.size}`);
    console.log(`Kategoriler: ${Array.from(categoriesSet).join(', ')}`);
    
  } catch (error) {
    console.error('Hata oluştu:', error);
    
    if (error.statusCode === 401) {
      console.error('API anahtarı geçersiz veya yetkilendirme hatası.');
    } else if (error.statusCode === 404) {
      console.error('Base ID veya Table ID bulunamadı.');
    } else {
      console.error('Detaylı hata:', error.message);
    }
  }
}

// Run the script
fetchMarkalar();