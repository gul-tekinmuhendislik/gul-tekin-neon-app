require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');
const { sql } = require('./lib/db');

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

console.log('Syncing projeler images from Airtable...\n');

async function syncProjelerFromAirtable() {
  try {
    // Get all records with null cloudinary_url
    const records = await sql`
      SELECT id, airtable_id, isim
      FROM projeler_2026
      WHERE cloudinary_url IS NULL
        AND airtable_id IS NOT NULL
      ORDER BY id
    `;
    
    console.log(`Found ${records.length} records to update\n`);
    
    let updated = 0;
    let failed = 0;
    
    for (const record of records) {
      try {
        // Fetch from Airtable
        const airtableRecord = await base('tblY0QLZQJIsz30ge').find(record.airtable_id);
        
        // Get image URL from Airtable
        const resimlerField = airtableRecord.get('Resimler');
        
        if (resimlerField && resimlerField.length > 0) {
          const imageUrl = resimlerField[0].url;
          
          // Update database with Airtable URL
          await sql`
            UPDATE projeler_2026
            SET 
              resim_url = ${imageUrl},
              guncelleme_tarihi = CURRENT_TIMESTAMP
            WHERE id = ${record.id}
          `;
          
          console.log(`✅ Updated: ${record.isim}`);
          updated++;
        } else {
          console.log(`⚠️  No image: ${record.isim}`);
        }
        
      } catch (error) {
        console.log(`❌ Failed: ${record.isim} - ${error.message}`);
        failed++;
      }
      
      // Rate limiting - wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n✅ Summary: ${updated} updated, ${failed} failed`);
    
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Run the sync
syncProjelerFromAirtable();