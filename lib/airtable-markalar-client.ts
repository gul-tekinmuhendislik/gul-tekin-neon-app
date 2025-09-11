import Airtable from 'airtable';
import { sql } from '@/lib/db';

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_MARKALAR = process.env.AIRTABLE_TABLE_ID_MARKALAR || 'Markalar';

// Initialize Airtable client
if (!AIRTABLE_API_KEY) {
  console.warn('AIRTABLE_API_KEY is not set in environment variables');
}

if (!AIRTABLE_BASE_ID) {
  console.warn('AIRTABLE_BASE_ID is not set in environment variables');
}

// Configure Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

// Get base instance
export const getAirtableBase = () => {
  if (!AIRTABLE_BASE_ID) {
    throw new Error('AIRTABLE_BASE_ID is not configured');
  }
  return Airtable.base(AIRTABLE_BASE_ID);
};

// Type definition for Marka record
export interface MarkaRecord {
  id?: string;
  fields: {
    Name?: string;
    Slug?: string;
    Email?: string;
    URL?: string;
    Attachments?: Array<{ url: string; filename: string; type?: string }>;
    Website?: string;
    Category?: string;
    Notes?: string;
    AuthorizedService?: boolean;
    Active?: boolean;
    Order?: number;
    CreatedTime?: string;
  };
}

// Get all Markalar from Airtable
export async function getMarkalar() {
  try {
    const base = getAirtableBase();
    const records: MarkaRecord[] = [];
    
    console.log(`Fetching from table: ${AIRTABLE_TABLE_ID_MARKALAR}`);
    
    await base(AIRTABLE_TABLE_ID_MARKALAR)
      .select({
        // Get all fields - no sorting if field doesn't exist
        view: "Grid view", // Default view
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          records.push({
            id: record.id,
            fields: record.fields as MarkaRecord['fields'],
          });
        });
        fetchNextPage();
      });
    
    console.log(`Fetched ${records.length} brands from Airtable`);
    return records;
  } catch (error) {
    console.error('Error fetching Markalar from Airtable:', error);
    throw error;
  }
}

// Get active Markalar only
export async function getActiveMarkalar() {
  try {
    const base = getAirtableBase();
    const records: MarkaRecord[] = [];
    
    await base(AIRTABLE_TABLE_ID_MARKALAR)
      .select({
        // No filter for now - just get all
        view: "Grid view",
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          records.push({
            id: record.id,
            fields: record.fields as MarkaRecord['fields'],
          });
        });
        fetchNextPage();
      });
    
    return records;
  } catch (error) {
    console.error('Error fetching active Markalar from Airtable:', error);
    throw error;
  }
}

// Sync Markalar to Neon database
export async function syncMarkalarToNeon() {
  try {
    console.log('Starting Markalar sync to Neon database...');
    
    // First, create the table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS markalar (
        id TEXT PRIMARY KEY,
        marka_adi TEXT,
        slug TEXT,
        email TEXT,
        url TEXT,
        logo_url TEXT,
        website TEXT,
        kategori TEXT,
        aciklama TEXT,
        yetkili_servis BOOLEAN DEFAULT false,
        aktif BOOLEAN DEFAULT true,
        siralama_no INTEGER,
        airtable_created_time TIMESTAMP,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add new columns if they don't exist (for existing tables)
    await sql`
      ALTER TABLE markalar 
      ADD COLUMN IF NOT EXISTS slug TEXT,
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS url TEXT
    `.catch(() => {
      // Ignore error if columns already exist
    });
    
    // Get all brands from Airtable
    const markalar = await getMarkalar();
    
    if (markalar.length === 0) {
      console.log('No brands found in Airtable');
      return {
        success: true,
        count: 0,
        message: 'No brands to sync',
      };
    }
    
    // Sync each brand to database
    let syncedCount = 0;
    for (const marka of markalar) {
      try {
        // Get the first attachment URL if available
        const logoUrl = marka.fields.Attachments?.[0]?.url || null;
        
        await sql`
          INSERT INTO markalar (
            id,
            marka_adi,
            slug,
            email,
            url,
            logo_url,
            website,
            kategori,
            aciklama,
            yetkili_servis,
            aktif,
            siralama_no,
            airtable_created_time,
            synced_at
          ) VALUES (
            ${marka.id},
            ${marka.fields.Name || null},
            ${marka.fields.Slug || null},
            ${marka.fields.Email || null},
            ${marka.fields.URL || null},
            ${logoUrl},
            ${marka.fields.Website || null},
            ${marka.fields.Category || null},
            ${marka.fields.Notes || null},
            ${marka.fields.AuthorizedService || false},
            ${marka.fields.Active !== false},
            ${marka.fields.Order || 999},
            ${marka.fields.CreatedTime || null},
            ${new Date().toISOString()}
          )
          ON CONFLICT (id)
          DO UPDATE SET
            marka_adi = EXCLUDED.marka_adi,
            slug = EXCLUDED.slug,
            email = EXCLUDED.email,
            url = EXCLUDED.url,
            logo_url = EXCLUDED.logo_url,
            website = EXCLUDED.website,
            kategori = EXCLUDED.kategori,
            aciklama = EXCLUDED.aciklama,
            yetkili_servis = EXCLUDED.yetkili_servis,
            aktif = EXCLUDED.aktif,
            siralama_no = EXCLUDED.siralama_no,
            airtable_created_time = EXCLUDED.airtable_created_time,
            updated_at = CURRENT_TIMESTAMP,
            synced_at = EXCLUDED.synced_at
        `;
        
        syncedCount++;
        console.log(`Synced brand: ${marka.fields.Name} (${marka.id}) - Slug: ${marka.fields.Slug || 'N/A'}, Email: ${marka.fields.Email || 'N/A'}, URL: ${marka.fields.URL || 'N/A'}`);
      } catch (error) {
        console.error(`Error syncing brand ${marka.id}:`, error);
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
        'airtable.markalar.synced',
        'integration',
        'success',
        ${JSON.stringify({
          totalRecords: markalar.length,
          syncedCount,
          timestamp: new Date().toISOString(),
        })},
        ${JSON.stringify({
          source: 'manual_sync',
          table: AIRTABLE_TABLE_ID_MARKALAR,
        })}
      )
    `;
    
    console.log(`Successfully synced ${syncedCount} out of ${markalar.length} brands`);
    
    return {
      success: true,
      count: syncedCount,
      total: markalar.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error syncing Markalar to Neon:', error);
    
    // Log the error
    await sql`
      INSERT INTO event_logs (
        event_name,
        event_type,
        status,
        payload,
        metadata
      ) VALUES (
        'airtable.markalar.sync_failed',
        'integration',
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

// Get Markalar from Neon database
export async function getMarkalarFromNeon() {
  try {
    const result = await sql`
      SELECT 
        id,
        marka_adi,
        slug,
        email,
        url,
        logo_url,
        website,
        kategori,
        aciklama,
        yetkili_servis,
        aktif,
        siralama_no,
        synced_at,
        updated_at
      FROM markalar
      WHERE aktif = true
      ORDER BY siralama_no ASC, marka_adi ASC
    `;
    
    return result;
  } catch (error) {
    console.error('Error fetching Markalar from Neon:', error);
    throw error;
  }
}