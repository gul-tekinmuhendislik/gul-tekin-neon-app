require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

console.log('Checking Airtable projeler table fields...\n');

async function checkFields() {
  try {
    // Get first record to see all fields
    const records = await base('tblY0QLZQJIsz30ge')
      .select({
        maxRecords: 1
      })
      .firstPage();
    
    if (records.length > 0) {
      const record = records[0];
      console.log('Record ID:', record.id);
      console.log('\nAvailable fields:');
      
      const fields = record.fields;
      Object.keys(fields).forEach(key => {
        const value = fields[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`  - ${key}: ${type}`);
        
        // If it's an array with attachments, show details
        if (Array.isArray(value) && value.length > 0 && value[0].url) {
          console.log(`    -> Attachment URL: ${value[0].url}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFields();