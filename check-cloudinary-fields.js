require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_PROJELER = process.env.AIRTABLE_TABLE_ID_PROJELER || 'Projeler';

Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

const base = Airtable.base(AIRTABLE_BASE_ID);

async function checkFields() {
  console.log('Checking Airtable fields for Projeler table...\n');
  
  try {
    const records = await base(AIRTABLE_TABLE_ID_PROJELER)
      .select({
        maxRecords: 1,
        view: 'Grid view',
      })
      .firstPage();
    
    if (records.length === 0) {
      console.log('No records found');
      return;
    }
    
    const record = records[0];
    const fields = record.fields;
    const fieldNames = Object.keys(fields);
    
    console.log('Project Name:', fields['Proje Adı']);
    console.log('\nAll field names:');
    console.log('================');
    fieldNames.forEach(name => {
      console.log(`- ${name}`);
    });
    
    console.log('\n\nChecking for cloudinary-related fields:');
    console.log('========================================');
    
    fieldNames.forEach(name => {
      const nameLower = name.toLowerCase();
      if (nameLower.includes('cloudinary') || 
          nameLower.includes('cloud') || 
          nameLower.includes('galeri') || 
          nameLower.includes('gallery')) {
        console.log(`\nFound potential field: "${name}"`);
        const value = fields[name];
        console.log('  Type:', Array.isArray(value) ? 'array' : typeof value);
        if (Array.isArray(value)) {
          console.log('  Length:', value.length);
          if (value.length > 0) {
            console.log('  First item:', JSON.stringify(value[0], null, 2));
          }
        } else if (typeof value === 'string') {
          console.log('  Value:', value.substring(0, 100));
        }
      }
    });
    
    console.log('\n\nChecking attachment fields for cloudinary URLs:');
    console.log('================================================');
    
    fieldNames.forEach(name => {
      const value = fields[name];
      if (Array.isArray(value) && value.length > 0 && value[0]?.url) {
        console.log(`\nField: "${name}"`);
        value.forEach((item, index) => {
          if (item.url) {
            const isCloudinary = item.url.includes('cloudinary');
            console.log(`  [${index}] ${isCloudinary ? '✓ CLOUDINARY' : '✗ NOT CLOUDINARY'}: ${item.url.substring(0, 80)}...`);
          }
        });
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFields();