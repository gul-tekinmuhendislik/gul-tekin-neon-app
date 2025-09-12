import * as dotenv from 'dotenv';
import path from 'path';
import Airtable from 'airtable';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('Testing Airtable connection...');
console.log('API Key:', process.env.AIRTABLE_API_KEY ? 'Set' : 'Not set');
console.log('Base ID:', process.env.AIRTABLE_BASE_ID);
console.log('Table ID:', process.env.AIRTABLE_TABLE_ID_MARKALAR);

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Configure Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    const records = await base(process.env.AIRTABLE_TABLE_ID_MARKALAR!)
      .select({
        maxRecords: 3,
        view: "Grid view"
      })
      .firstPage();
    
    console.log(`✅ Successfully connected! Found ${records.length} records`);
    
    records.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log('  ID:', record.id);
      console.log('  Name:', record.get('Name'));
      console.log('  Hizmetlerimiz:', record.get('Hizmetlerimiz'));
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testConnection();