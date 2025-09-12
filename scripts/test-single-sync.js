const dotenv = require('dotenv');
const { neon } = require('@neondatabase/serverless');

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testSingleSync() {
  console.log('Testing single record sync...');
  
  try {
    // 1. First, let's see what we have in Neon
    console.log('\n1. Checking first record in Neon markalar table:');
    const neonRecords = await sql`
      SELECT id, marka_adi, airtable_hizmetler_id 
      FROM markalar 
      LIMIT 1
    `;
    
    if (neonRecords.length === 0) {
      console.log('No records found in Neon!');
      return;
    }
    
    const firstRecord = neonRecords[0];
    console.log('Found record:');
    console.log('  ID:', firstRecord.id);
    console.log('  Name:', firstRecord.marka_adi);
    console.log('  Current airtable_hizmetler_id:', firstRecord.airtable_hizmetler_id);
    
    // 2. Get the same record from Airtable using fetch
    console.log('\n2. Fetching same record from Airtable...');
    const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID_MARKALAR}/${firstRecord.id}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.log('Airtable response:', response.status, text);
      return;
    }
    
    const airtableData = await response.json();
    console.log('Airtable record found:');
    console.log('  Name:', airtableData.fields.Name);
    console.log('  Hizmetlerimiz:', airtableData.fields.Hizmetlerimiz);
    
    // 3. Update the Neon record if Hizmetlerimiz exists
    if (airtableData.fields.Hizmetlerimiz && airtableData.fields.Hizmetlerimiz.length > 0) {
      console.log('\n3. Updating Neon record with Hizmetlerimiz IDs...');
      
      await sql`
        UPDATE markalar 
        SET airtable_hizmetler_id = ${JSON.stringify(airtableData.fields.Hizmetlerimiz)}::jsonb
        WHERE id = ${firstRecord.id}
      `;
      
      console.log('✅ Update successful!');
      
      // 4. Verify the update
      console.log('\n4. Verifying update...');
      const updated = await sql`
        SELECT id, marka_adi, airtable_hizmetler_id 
        FROM markalar 
        WHERE id = ${firstRecord.id}
      `;
      
      console.log('Updated record:');
      console.log('  ID:', updated[0].id);
      console.log('  Name:', updated[0].marka_adi);
      console.log('  airtable_hizmetler_id:', updated[0].airtable_hizmetler_id);
    } else {
      console.log('\n⚠️ This record has no Hizmetlerimiz data in Airtable');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testSingleSync();