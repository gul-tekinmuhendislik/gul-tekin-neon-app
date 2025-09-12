import Airtable from 'airtable';
import { neon } from '@neondatabase/serverless';

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_MARKALAR = process.env.AIRTABLE_TABLE_ID_MARKALAR || 'Markalar';

// Function to get Airtable base
function getBase() {
  Airtable.configure({
    apiKey: AIRTABLE_API_KEY,
  });
  return Airtable.base(AIRTABLE_BASE_ID);
}

// Function to get database connection
function getSql() {
  return neon(process.env.DATABASE_URL!);
}

// Type for Airtable Marka record with Hizmetlerimiz field
interface AirtableMarkaWithHizmetler {
  id: string;
  fields: {
    Name?: string;
    Hizmetlerimiz?: string[]; // Array of Hizmetler record IDs
    [key: string]: unknown;
  };
}

// Function to check current Neon table structure
export async function checkNeonTableStructure() {
  try {
    const sql = getSql();
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'markalar' 
      ORDER BY ordinal_position;
    `;
    
    console.log('Current Neon markalar table columns:');
    result.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    return result;
  } catch (error) {
    console.error('Error checking table structure:', error);
    throw error;
  }
}

// Function to add airtable_hizmetler_id column to Neon
export async function addHizmetlerIdColumn() {
  try {
    const sql = getSql();
    // First check if column already exists
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'markalar' 
      AND column_name = 'airtable_hizmetler_id';
    `;
    
    if (existingColumns.length > 0) {
      console.log('Column airtable_hizmetler_id already exists');
      return { status: 'already_exists' };
    }
    
    // Add the new column as JSONB to store array of IDs
    await sql`
      ALTER TABLE markalar 
      ADD COLUMN airtable_hizmetler_id JSONB;
    `;
    
    console.log('Successfully added airtable_hizmetler_id column');
    return { status: 'added' };
  } catch (error) {
    console.error('Error adding column:', error);
    throw error;
  }
}

// Function to get all markalar from Airtable with Hizmetlerimiz field
export async function getAirtableMarkalarWithHizmetler() {
  try {
    const base = getBase();
    const records: AirtableMarkaWithHizmetler[] = [];
    
    await base(AIRTABLE_TABLE_ID_MARKALAR)
      .select({
        view: "Grid view",
        fields: ['Name', 'Hizmetlerimiz', 'Slug', 'Email', 'URL', 'Website', 'Category', 'Notes', 'AuthorizedService', 'Active', 'Order', 'CreatedTime']
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
    
    console.log(`Fetched ${records.length} brands from Airtable`);
    return records;
  } catch (error) {
    console.error('Error fetching brands from Airtable:', error);
    throw error;
  }
}

// Function to get all markalar from Neon
export async function getNeonMarkalar() {
  try {
    const sql = getSql();
    const result = await sql`
      SELECT id, marka_adi, airtable_hizmetler_id
      FROM markalar
      ORDER BY marka_adi;
    `;
    
    return result;
  } catch (error) {
    console.error('Error fetching markalar from Neon:', error);
    throw error;
  }
}

// Function to sync Hizmetlerimiz IDs from Airtable to Neon
export async function syncHizmetlerIds() {
  try {
    const sql = getSql();
    console.log('Starting Hizmetlerimiz ID sync...');
    
    // Step 1: Add column if not exists
    const columnStatus = await addHizmetlerIdColumn();
    console.log('Column status:', columnStatus);
    
    // Step 2: Get all records from Airtable
    const airtableRecords = await getAirtableMarkalarWithHizmetler();
    console.log(`Found ${airtableRecords.length} records in Airtable`);
    
    // Step 3: Get all records from Neon
    const neonRecords = await getNeonMarkalar();
    console.log(`Found ${neonRecords.length} records in Neon`);
    
    // Step 4: Update each Neon record with matching Airtable Hizmetlerimiz IDs
    let updatedCount = 0;
    let matchedCount = 0;
    
    for (const airtableRecord of airtableRecords) {
      // Find matching Neon record by Airtable ID
      const neonRecord = neonRecords.find(n => n.id === airtableRecord.id);
      
      if (neonRecord) {
        matchedCount++;
        console.log(`Matched: ${airtableRecord.fields.Name} (${airtableRecord.id})`);
        
        // Check if Airtable record has Hizmetlerimiz field
        if (airtableRecord.fields.Hizmetlerimiz && airtableRecord.fields.Hizmetlerimiz.length > 0) {
          // Update Neon record with Hizmetlerimiz IDs
          await sql`
            UPDATE markalar 
            SET airtable_hizmetler_id = ${JSON.stringify(airtableRecord.fields.Hizmetlerimiz)}
            WHERE id = ${airtableRecord.id};
          `;
          
          updatedCount++;
          console.log(`  Updated with ${airtableRecord.fields.Hizmetlerimiz.length} hizmet IDs`);
        } else {
          console.log(`  No Hizmetlerimiz data`);
        }
      } else {
        console.warn(`No matching Neon record for Airtable ID: ${airtableRecord.id} (${airtableRecord.fields.Name})`);
      }
    }
    
    // Log the sync event
    await sql`
      INSERT INTO event_logs (
        event_name,
        event_type,
        status,
        payload,
        metadata
      ) VALUES (
        'markalar.hizmetler_ids.synced',
        'data_sync',
        'success',
        ${JSON.stringify({
          totalAirtableRecords: airtableRecords.length,
          totalNeonRecords: neonRecords.length,
          matchedRecords: matchedCount,
          updatedRecords: updatedCount,
          timestamp: new Date().toISOString(),
        })},
        ${JSON.stringify({
          source: 'manual_sync',
          columnAdded: columnStatus.status,
        })}
      )
    `;
    
    console.log('\n=== Sync Summary ==="');
    console.log(`Total Airtable records: ${airtableRecords.length}`);
    console.log(`Total Neon records: ${neonRecords.length}`);
    console.log(`Matched records: ${matchedCount}`);
    console.log(`Updated records: ${updatedCount}`);
    
    return {
      success: true,
      totalAirtableRecords: airtableRecords.length,
      totalNeonRecords: neonRecords.length,
      matchedRecords: matchedCount,
      updatedRecords: updatedCount,
    };
  } catch (error) {
    console.error('Error syncing Hizmetlerimiz IDs:', error);
    
    // Log the error
    const sql = getSql();
    await sql`
      INSERT INTO event_logs (
        event_name,
        event_type,
        status,
        payload,
        metadata
      ) VALUES (
        'markalar.hizmetler_ids.sync_failed',
        'data_sync',
        'failed',
        ${JSON.stringify({ error: String(error) })},
        ${JSON.stringify({
          source: 'manual_sync',
          timestamp: new Date().toISOString(),
        })}
      )
    `;
    
    throw error;
  }
}

// Function to verify the sync
export async function verifySyncedData() {
  try {
    const sql = getSql();
    const result = await sql`
      SELECT 
        id,
        marka_adi,
        airtable_hizmetler_id,
        jsonb_array_length(airtable_hizmetler_id) as hizmet_count
      FROM markalar
      WHERE airtable_hizmetler_id IS NOT NULL
      ORDER BY marka_adi;
    `;
    
    console.log('\n=== Verification Results ==="');
    console.log(`Brands with Hizmetler IDs: ${result.length}`);
    
    result.forEach(row => {
      console.log(`- ${row.marka_adi}: ${row.hizmet_count} hizmet`);
    });
    
    return result;
  } catch (error) {
    console.error('Error verifying synced data:', error);
    throw error;
  }
}