const dotenv = require('dotenv');
const { neon } = require('@neondatabase/serverless');
const Airtable = require('airtable');

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Configure Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

async function testSyncWithSDK() {
  console.log('Testing sync with Airtable SDK...');
  console.log('Base ID:', process.env.AIRTABLE_BASE_ID);
  console.log('Table ID:', process.env.AIRTABLE_TABLE_ID_MARKALAR);
  
  try {
    // 1. Get first record from Airtable using SDK
    console.log('\n1. Fetching first record from Airtable using SDK...');
    
    // Try with table name "Markalar"
    const records = await base('Markalar')
      .select({
        maxRecords: 1,
        view: "Grid view"
      })
      .firstPage();
    
    if (records.length === 0) {
      console.log('No records found!');
      return;
    }
    
    const airtableRecord = records[0];
    console.log('\nAirtable record found:');
    console.log('  ID:', airtableRecord.id);
    console.log('  Name:', airtableRecord.get('Name'));
    console.log('  Hizmetlerimiz:', airtableRecord.get('Hizmetlerimiz'));
    
    // 2. Check if this record exists in Neon
    console.log('\n2. Checking if record exists in Neon...');
    const neonRecord = await sql`
      SELECT id, marka_adi, airtable_hizmetler_id 
      FROM markalar 
      WHERE id = ${airtableRecord.id}
    `;
    
    if (neonRecord.length === 0) {
      console.log('⚠️ Record not found in Neon. Inserting...');
      
      const hizmetlerIds = airtableRecord.get('Hizmetlerimiz');
      await sql`
        INSERT INTO markalar (id, marka_adi, airtable_hizmetler_id)
        VALUES (
          ${airtableRecord.id},
          ${airtableRecord.get('Name')},
          ${hizmetlerIds ? JSON.stringify(hizmetlerIds) : null}::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          marka_adi = EXCLUDED.marka_adi,
          airtable_hizmetler_id = EXCLUDED.airtable_hizmetler_id
      `;
      console.log('✅ Record inserted/updated!');
      
    } else {
      console.log('Record exists in Neon:');
      console.log('  Current Name:', neonRecord[0].marka_adi);
      console.log('  Current Hizmetler IDs:', neonRecord[0].airtable_hizmetler_id);
      
      // Update with Hizmetlerimiz
      const hizmetlerIds = airtableRecord.get('Hizmetlerimiz');
      if (hizmetlerIds && hizmetlerIds.length > 0) {
        console.log('\n3. Updating Hizmetlerimiz IDs...');
        await sql`
          UPDATE markalar 
          SET airtable_hizmetler_id = ${JSON.stringify(hizmetlerIds)}::jsonb
          WHERE id = ${airtableRecord.id}
        `;
        console.log('✅ Updated with', hizmetlerIds.length, 'hizmet IDs');
      }
    }
    
    // 3. Verify final state
    console.log('\n4. Verifying final state...');
    const finalRecord = await sql`
      SELECT id, marka_adi, airtable_hizmetler_id 
      FROM markalar 
      WHERE id = ${airtableRecord.id}
    `;
    
    console.log('Final record:');
    console.log('  ID:', finalRecord[0].id);
    console.log('  Name:', finalRecord[0].marka_adi);
    console.log('  Hizmetler IDs:', finalRecord[0].airtable_hizmetler_id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
}

testSyncWithSDK();