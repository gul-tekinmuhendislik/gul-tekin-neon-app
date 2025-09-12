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

async function syncAllMarkalarBatch() {
  console.log('Starting batch sync for all Markalar...');
  console.log('Processing 25 records at a time\n');
  
  try {
    // 1. Get all records from Airtable
    console.log('1. Fetching all records from Airtable...');
    const allRecords = [];
    
    await base('Markalar')
      .select({
        view: "Grid view"
      })
      .eachPage((records, fetchNextPage) => {
        allRecords.push(...records);
        fetchNextPage();
      });
    
    console.log(`Total records fetched from Airtable: ${allRecords.length}\n`);
    
    // 2. Process in batches of 25
    const batchSize = 25;
    let totalUpdated = 0;
    let totalWithHizmetler = 0;
    
    for (let i = 0; i < allRecords.length; i += batchSize) {
      const batch = allRecords.slice(i, Math.min(i + batchSize, allRecords.length));
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allRecords.length / batchSize);
      
      console.log(`\n=== Batch ${batchNumber}/${totalBatches} (Records ${i + 1}-${Math.min(i + batchSize, allRecords.length)}) ===`);
      
      for (const record of batch) {
        const id = record.id;
        const name = record.get('Name');
        const hizmetlerIds = record.get('Hizmetlerimiz');
        
        try {
          // Check if record exists in Neon
          const existing = await sql`
            SELECT id FROM markalar WHERE id = ${id}
          `;
          
          if (existing.length === 0) {
            // Insert new record
            await sql`
              INSERT INTO markalar (id, marka_adi, airtable_hizmetler_id)
              VALUES (
                ${id},
                ${name},
                ${hizmetlerIds ? JSON.stringify(hizmetlerIds) : null}::jsonb
              )
            `;
            console.log(`  ✅ Inserted: ${name}`);
          } else {
            // Update existing record
            await sql`
              UPDATE markalar 
              SET 
                marka_adi = ${name},
                airtable_hizmetler_id = ${hizmetlerIds ? JSON.stringify(hizmetlerIds) : null}::jsonb
              WHERE id = ${id}
            `;
            console.log(`  ✓ Updated: ${name}`);
          }
          
          totalUpdated++;
          if (hizmetlerIds && hizmetlerIds.length > 0) {
            totalWithHizmetler++;
            console.log(`    -> Has ${hizmetlerIds.length} hizmet(ler)`);
          }
          
        } catch (error) {
          console.error(`  ❌ Error processing ${name}:`, error.message);
        }
      }
      
      // Show progress
      const progress = Math.round((Math.min(i + batchSize, allRecords.length) / allRecords.length) * 100);
      console.log(`\nProgress: ${progress}% complete`);
      
      // Small delay between batches to avoid overwhelming the database
      if (i + batchSize < allRecords.length) {
        console.log('Waiting 1 second before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 3. Final summary
    console.log('\n' + '='.repeat(50));
    console.log('SYNC COMPLETED!');
    console.log('='.repeat(50));
    console.log(`Total Airtable records: ${allRecords.length}`);
    console.log(`Total synced to Neon: ${totalUpdated}`);
    console.log(`Records with Hizmetler: ${totalWithHizmetler}`);
    
    // 4. Verify the sync
    console.log('\nVerifying sync...');
    const neonCount = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(airtable_hizmetler_id) as with_hizmetler
      FROM markalar
    `;
    
    console.log(`Neon database now has:`);
    console.log(`  - Total records: ${neonCount[0].total}`);
    console.log(`  - Records with Hizmetler IDs: ${neonCount[0].with_hizmetler}`);
    
    // Show sample records with Hizmetler
    const samples = await sql`
      SELECT marka_adi, 
             jsonb_array_length(airtable_hizmetler_id) as hizmet_count
      FROM markalar 
      WHERE airtable_hizmetler_id IS NOT NULL
      ORDER BY hizmet_count DESC
      LIMIT 5
    `;
    
    if (samples.length > 0) {
      console.log('\nTop 5 brands by number of Hizmetler:');
      samples.forEach(s => {
        console.log(`  - ${s.marka_adi}: ${s.hizmet_count} hizmet(ler)`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
}

syncAllMarkalarBatch();