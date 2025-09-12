import Airtable from 'airtable';
import { sql } from '@/lib/db';

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_ANAFAALIYET = process.env.AIRTABLE_TABLE_ID_ANAFAALIYET || 'AnafaaLiyet';

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

// Type definition for AnafaaLiyet record
export interface AnafaaliyetRecord {
  id?: string;
  fields: {
    Name?: string;
    Slug?: string;
    Description?: string;
    Title?: string;
    Content?: string;
    Category?: string;
    Tags?: string[];
    Icon?: string;
    Priority?: number;
    Attachments?: Array<{ url: string; filename: string; type?: string }>;
    Active?: boolean;
    Order?: number;
    CreatedTime?: string;
    Featured?: boolean;
    Summary?: string;
    Keywords?: string[];
  };
}

// Get all AnafaaLiyet from Airtable
export async function getAnafaaliyet() {
  try {
    const base = getAirtableBase();
    const records: AnafaaliyetRecord[] = [];
    
    console.log(`Fetching from table: ${AIRTABLE_TABLE_ID_ANAFAALIYET}`);
    
    await base(AIRTABLE_TABLE_ID_ANAFAALIYET)
      .select({
        view: "Grid view", // Default view
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          records.push({
            id: record.id,
            fields: record.fields as AnafaaliyetRecord['fields'],
          });
        });
        fetchNextPage();
      });
    
    console.log(`Fetched ${records.length} activities from Airtable`);
    return records;
  } catch (error) {
    console.error('Error fetching AnafaaLiyet from Airtable:', error);
    throw error;
  }
}

// Get active AnafaaLiyet only
export async function getActiveAnafaaliyet() {
  try {
    const base = getAirtableBase();
    const records: AnafaaliyetRecord[] = [];
    
    await base(AIRTABLE_TABLE_ID_ANAFAALIYET)
      .select({
        view: "Grid view",
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          records.push({
            id: record.id,
            fields: record.fields as AnafaaliyetRecord['fields'],
          });
        });
        fetchNextPage();
      });
    
    return records;
  } catch (error) {
    console.error('Error fetching active AnafaaLiyet from Airtable:', error);
    throw error;
  }
}

// Sync AnafaaLiyet to Neon database
export async function syncAnafaaliyetToNeon() {
  try {
    console.log('Starting AnafaaLiyet sync to Neon database...');
    
    // First, create the table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS anafaaliyet (
        id TEXT PRIMARY KEY,
        faaliyet_adi TEXT,
        slug TEXT,
        aciklama TEXT,
        baslik TEXT,
        icerik TEXT,
        kategori TEXT,
        etiketler TEXT[],
        ikon TEXT,
        oncelik INTEGER,
        gorsel_url TEXT,
        aktif BOOLEAN DEFAULT true,
        siralama_no INTEGER,
        ozelik BOOLEAN DEFAULT false,
        ozet TEXT,
        anahtar_kelimeler TEXT[],
        airtable_created_time TIMESTAMP,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cloudinary_url TEXT,
        cloudinary_public_id TEXT
      )
    `;
    
    // Add new columns if they don't exist (for existing tables)
    await sql`
      ALTER TABLE anafaaliyet 
      ADD COLUMN IF NOT EXISTS slug TEXT,
      ADD COLUMN IF NOT EXISTS baslik TEXT,
      ADD COLUMN IF NOT EXISTS icerik TEXT,
      ADD COLUMN IF NOT EXISTS etiketler TEXT[],
      ADD COLUMN IF NOT EXISTS ikon TEXT,
      ADD COLUMN IF NOT EXISTS oncelik INTEGER,
      ADD COLUMN IF NOT EXISTS ozelik BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS ozet TEXT,
      ADD COLUMN IF NOT EXISTS anahtar_kelimeler TEXT[],
      ADD COLUMN IF NOT EXISTS cloudinary_url TEXT,
      ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT
    `.catch(() => {
      // Ignore error if columns already exist
    });
    
    // Get all activities from Airtable
    const anafaaliyet = await getAnafaaliyet();
    
    if (anafaaliyet.length === 0) {
      console.log('No activities found in Airtable');
      return {
        success: true,
        count: 0,
        message: 'No activities to sync',
      };
    }
    
    // Sync each activity to database
    let syncedCount = 0;
    for (const faaliyet of anafaaliyet) {
      try {
        // Get the first attachment URL if available
        const gorselUrl = faaliyet.fields.Attachments?.[0]?.url || null;
        
        await sql`
          INSERT INTO anafaaliyet (
            id,
            faaliyet_adi,
            slug,
            aciklama,
            baslik,
            icerik,
            kategori,
            etiketler,
            ikon,
            oncelik,
            gorsel_url,
            aktif,
            siralama_no,
            ozelik,
            ozet,
            anahtar_kelimeler,
            airtable_created_time,
            synced_at
          ) VALUES (
            ${faaliyet.id},
            ${faaliyet.fields.Name || null},
            ${faaliyet.fields.Slug || null},
            ${faaliyet.fields.Description || null},
            ${faaliyet.fields.Title || null},
            ${faaliyet.fields.Content || null},
            ${faaliyet.fields.Category || null},
            ${faaliyet.fields.Tags || null},
            ${faaliyet.fields.Icon || null},
            ${faaliyet.fields.Priority || 999},
            ${gorselUrl},
            ${faaliyet.fields.Active !== false},
            ${faaliyet.fields.Order || 999},
            ${faaliyet.fields.Featured || false},
            ${faaliyet.fields.Summary || null},
            ${faaliyet.fields.Keywords || null},
            ${faaliyet.fields.CreatedTime || null},
            ${new Date().toISOString()}
          )
          ON CONFLICT (id)
          DO UPDATE SET
            faaliyet_adi = EXCLUDED.faaliyet_adi,
            slug = EXCLUDED.slug,
            aciklama = EXCLUDED.aciklama,
            baslik = EXCLUDED.baslik,
            icerik = EXCLUDED.icerik,
            kategori = EXCLUDED.kategori,
            etiketler = EXCLUDED.etiketler,
            ikon = EXCLUDED.ikon,
            oncelik = EXCLUDED.oncelik,
            gorsel_url = EXCLUDED.gorsel_url,
            aktif = EXCLUDED.aktif,
            siralama_no = EXCLUDED.siralama_no,
            ozelik = EXCLUDED.ozelik,
            ozet = EXCLUDED.ozet,
            anahtar_kelimeler = EXCLUDED.anahtar_kelimeler,
            airtable_created_time = EXCLUDED.airtable_created_time,
            updated_at = CURRENT_TIMESTAMP,
            synced_at = EXCLUDED.synced_at
        `;
        
        syncedCount++;
        console.log(`Synced activity: ${faaliyet.fields.Name} (${faaliyet.id}) - Category: ${faaliyet.fields.Category || 'N/A'}, Priority: ${faaliyet.fields.Priority || 'N/A'}`);
      } catch (error) {
        console.error(`Error syncing activity ${faaliyet.id}:`, error);
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
        'airtable.anafaaliyet.synced',
        'integration',
        'success',
        ${JSON.stringify({
          totalRecords: anafaaliyet.length,
          syncedCount,
          timestamp: new Date().toISOString(),
        })},
        ${JSON.stringify({
          source: 'manual_sync',
          table: AIRTABLE_TABLE_ID_ANAFAALIYET,
        })}
      )
    `;
    
    console.log(`Successfully synced ${syncedCount} out of ${anafaaliyet.length} activities`);
    
    return {
      success: true,
      count: syncedCount,
      total: anafaaliyet.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error syncing AnafaaLiyet to Neon:', error);
    
    // Log the error
    await sql`
      INSERT INTO event_logs (
        event_name,
        event_type,
        status,
        payload,
        metadata
      ) VALUES (
        'airtable.anafaaliyet.sync_failed',
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

// Get AnafaaLiyet from Neon database
export async function getAnafaaliyetFromNeon() {
  try {
    const result = await sql`
      SELECT 
        id,
        faaliyet_adi,
        slug,
        aciklama,
        baslik,
        icerik,
        kategori,
        etiketler,
        ikon,
        oncelik,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        aktif,
        siralama_no,
        ozelik,
        ozet,
        anahtar_kelimeler,
        synced_at,
        updated_at
      FROM anafaaliyet
      WHERE aktif = true
      ORDER BY oncelik ASC, siralama_no ASC, faaliyet_adi ASC
    `;
    
    return result;
  } catch (error) {
    console.error('Error fetching AnafaaLiyet from Neon:', error);
    throw error;
  }
}