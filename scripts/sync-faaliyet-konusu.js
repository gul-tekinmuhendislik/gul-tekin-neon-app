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

async function syncFaaliyetKonusu() {
  console.log('Starting Ana faaliyet Konusu sync...');
  console.log('==========================================\n');
  
  try {
    // 1. First add the column if it doesn't exist
    console.log('1. Adding airtable_faaliyet_id column to Neon...');
    
    // Check if column exists
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'markalar' 
      AND column_name = 'airtable_faaliyet_id'
    `;
    
    if (existingColumns.length === 0) {
      await sql`
        ALTER TABLE markalar 
        ADD COLUMN airtable_faaliyet_id JSONB
      `;
      console.log('✅ Column airtable_faaliyet_id added successfully');
    } else {
      console.log('✓ Column airtable_faaliyet_id already exists');
    }
    
    // 2. Fetch all records from Airtable to get Ana faaliyet Konusu
    console.log('\n2. Fetching all records from Airtable...');
    const allRecords = [];
    
    await base('Markalar')
      .select({
        view: "Grid view",
        fields: ['Name', 'Ana faaliyet Konusu']
      })
      .eachPage((records, fetchNextPage) => {
        allRecords.push(...records);
        fetchNextPage();
      });
    
    console.log(`Fetched ${allRecords.length} records from Airtable\n`);
    
    // 3. Process all records
    console.log('3. Updating Neon records with Ana faaliyet Konusu IDs...');
    console.log('-'.repeat(50));
    
    let totalUpdated = 0;
    let totalWithFaaliyet = 0;
    
    for (const record of allRecords) {
      const id = record.id;
      const name = record.get('Name');
      const faaliyetIds = record.get('Ana faaliyet Konusu');
      
      try {
        // Update the record in Neon
        await sql`
          UPDATE markalar 
          SET airtable_faaliyet_id = ${faaliyetIds ? JSON.stringify(faaliyetIds) : null}::jsonb
          WHERE id = ${id}
        `;
        
        if (faaliyetIds && faaliyetIds.length > 0) {
          console.log(`✅ ${name}: ${faaliyetIds.length} faaliyet konusu`);
          totalWithFaaliyet++;
        } else {
          console.log(`✓ ${name}: No faaliyet konusu`);
        }
        
        totalUpdated++;
        
      } catch (error) {
        console.error(`❌ Error updating ${name}:`, error.message);
      }
    }
    
    // 4. Summary
    console.log('\n' + '='.repeat(50));
    console.log('SYNC COMPLETED!');
    console.log('='.repeat(50));
    console.log(`Total records processed: ${allRecords.length}`);
    console.log(`Successfully updated: ${totalUpdated}`);
    console.log(`Records with Ana faaliyet Konusu: ${totalWithFaaliyet}`);
    
    // 5. Verify the sync
    console.log('\n5. Verifying sync results...');
    
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(airtable_faaliyet_id) as with_faaliyet,
        SUM(CASE WHEN jsonb_array_length(airtable_faaliyet_id) > 1 THEN 1 ELSE 0 END) as multiple_faaliyet
      FROM markalar
    `;
    
    console.log('\nNeon database statistics:');
    console.log(`  Total records: ${stats[0].total}`);
    console.log(`  Records with faaliyet IDs: ${stats[0].with_faaliyet}`);
    console.log(`  Records with multiple faaliyet: ${stats[0].multiple_faaliyet || 0}`);
    
    // Show sample records
    const samples = await sql`
      SELECT 
        marka_adi,
        airtable_faaliyet_id,
        jsonb_array_length(airtable_faaliyet_id) as faaliyet_count
      FROM markalar 
      WHERE airtable_faaliyet_id IS NOT NULL
      ORDER BY faaliyet_count DESC
      LIMIT 5
    `;
    
    if (samples.length > 0) {
      console.log('\nTop 5 brands by number of faaliyet konusu:');
      samples.forEach(s => {
        console.log(`  - ${s.marka_adi}: ${s.faaliyet_count} faaliyet`);
        console.log(`    IDs: ${s.airtable_faaliyet_id}`);
      });
    }
    
    // Show a complete view of both fields
    console.log('\n6. Sample records with both Hizmetler and Faaliyet:');
    const complete = await sql`
      SELECT 
        marka_adi,
        jsonb_array_length(airtable_hizmetler_id) as hizmet_count,
        jsonb_array_length(airtable_faaliyet_id) as faaliyet_count
      FROM markalar 
      WHERE airtable_hizmetler_id IS NOT NULL 
        AND airtable_faaliyet_id IS NOT NULL
      LIMIT 5
    `;
    
    complete.forEach(c => {
      console.log(`  - ${c.marka_adi}: ${c.hizmet_count} hizmet, ${c.faaliyet_count} faaliyet`);
    });
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
  }
}

syncFaaliyetKonusu();