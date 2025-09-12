const dotenv = require('dotenv');
const { neon } = require('@neondatabase/serverless');
const fetch = require('node-fetch');

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testSyncByName() {
  console.log('Testing sync by matching names...');
  
  try {
    // 1. Get first record from Airtable
    console.log('\n1. Fetching first record from Airtable...');
    const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Markalar?maxRecords=1`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.log('Error:', response.status, text);
      return;
    }
    
    const data = await response.json();
    if (data.records.length === 0) {
      console.log('No records found in Airtable!');
      return;
    }
    
    const airtableRecord = data.records[0];
    console.log('Airtable record:');
    console.log('  ID:', airtableRecord.id);
    console.log('  Name:', airtableRecord.fields.Name);
    console.log('  Hizmetlerimiz:', airtableRecord.fields.Hizmetlerimiz);
    
    // 2. Find matching record in Neon by name
    console.log('\n2. Looking for matching record in Neon by name...');
    const neonRecords = await sql`
      SELECT id, marka_adi, airtable_hizmetler_id 
      FROM markalar 
      WHERE marka_adi = ${airtableRecord.fields.Name}
    `;
    
    if (neonRecords.length === 0) {
      console.log('⚠️ No matching record found in Neon for:', airtableRecord.fields.Name);
      console.log('\nTrying to find by Airtable ID...');
      
      // Try to find by Airtable ID
      const neonById = await sql`
        SELECT id, marka_adi, airtable_hizmetler_id 
        FROM markalar 
        WHERE id = ${airtableRecord.id}
      `;
      
      if (neonById.length === 0) {
        console.log('❌ Record not found in Neon at all. Need to sync from Airtable first.');
        
        // Insert the record
        console.log('\n3. Inserting new record to Neon...');
        await sql`
          INSERT INTO markalar (id, marka_adi, airtable_hizmetler_id)
          VALUES (
            ${airtableRecord.id},
            ${airtableRecord.fields.Name},
            ${airtableRecord.fields.Hizmetlerimiz ? JSON.stringify(airtableRecord.fields.Hizmetlerimiz) : null}::jsonb
          )
          ON CONFLICT (id) DO UPDATE SET
            marka_adi = EXCLUDED.marka_adi,
            airtable_hizmetler_id = EXCLUDED.airtable_hizmetler_id
        `;
        console.log('✅ Record inserted/updated successfully!');
      } else {
        console.log('Found by ID but name mismatch:');
        console.log('  Neon name:', neonById[0].marka_adi);
        console.log('  Airtable name:', airtableRecord.fields.Name);
        
        // Update the record
        console.log('\n3. Updating record...');
        await sql`
          UPDATE markalar 
          SET 
            marka_adi = ${airtableRecord.fields.Name},
            airtable_hizmetler_id = ${airtableRecord.fields.Hizmetlerimiz ? JSON.stringify(airtableRecord.fields.Hizmetlerimiz) : null}::jsonb
          WHERE id = ${airtableRecord.id}
        `;
        console.log('✅ Record updated successfully!');
      }
    } else {
      console.log('Found matching record in Neon:');
      console.log('  ID:', neonRecords[0].id);
      console.log('  Name:', neonRecords[0].marka_adi);
      console.log('  Current airtable_hizmetler_id:', neonRecords[0].airtable_hizmetler_id);
      
      // Update with Hizmetlerimiz if different
      if (airtableRecord.fields.Hizmetlerimiz) {
        console.log('\n3. Updating Hizmetlerimiz IDs...');
        await sql`
          UPDATE markalar 
          SET airtable_hizmetler_id = ${JSON.stringify(airtableRecord.fields.Hizmetlerimiz)}::jsonb
          WHERE id = ${neonRecords[0].id}
        `;
        console.log('✅ Update successful!');
      }
    }
    
    // 4. Verify the final state
    console.log('\n4. Verifying final state...');
    const finalRecord = await sql`
      SELECT id, marka_adi, airtable_hizmetler_id 
      FROM markalar 
      WHERE id = ${airtableRecord.id} OR marka_adi = ${airtableRecord.fields.Name}
      LIMIT 1
    `;
    
    if (finalRecord.length > 0) {
      console.log('Final record state:');
      console.log('  ID:', finalRecord[0].id);
      console.log('  Name:', finalRecord[0].marka_adi);
      console.log('  airtable_hizmetler_id:', finalRecord[0].airtable_hizmetler_id);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSyncByName();