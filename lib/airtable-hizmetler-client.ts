import Airtable from 'airtable';
import { sql } from '@/lib/db';

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_HIZMETLER = process.env.AIRTABLE_TABLE_ID_HIZMETLER || 'Hizmetler';

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

// Type definition for Hizmet record
export interface HizmetRecord {
  id?: string;
  fields: {
    'Hizmet Adı'?: string;
    'Açıklama'?: string;
    'Kategori'?: string;
    'Ana Faaliyet Konusu'?: string[];
    'Name (from Ana Faaliyet Konusu)'?: string[];
    'Resim'?: Array<{ url: string; filename: string; type?: string }>;
    'Markalar'?: string[];
    'Marka Text'?: string[];
    'Ürünler'?: string[];
    'SEO:Title'?: string;
    'SEO:Description'?: string;
    'SEO:Slug'?: string;
    'SEO:Index'?: number;
    'Last Modified'?: string;
  };
}

// Get all Hizmetler from Airtable
export async function getHizmetler() {
  try {
    const base = getAirtableBase();
    const records: HizmetRecord[] = [];
    
    console.log(`Fetching from table: ${AIRTABLE_TABLE_ID_HIZMETLER}`);
    
    await base(AIRTABLE_TABLE_ID_HIZMETLER)
      .select({
        view: "Grid view",
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          records.push({
            id: record.id,
            fields: record.fields as HizmetRecord['fields'],
          });
        });
        fetchNextPage();
      });
    
    console.log(`Fetched ${records.length} services from Airtable`);
    return records;
  } catch (error) {
    console.error('Error fetching Hizmetler from Airtable:', error);
    throw error;
  }
}

// Sync Hizmetler to Neon database
export async function syncHizmetlerToNeon() {
  try {
    console.log('Starting Hizmetler sync to Neon database...');
    
    // First, create the table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS hizmetler (
        id TEXT PRIMARY KEY,
        hizmet_adi TEXT,
        aciklama TEXT,
        kategori TEXT,
        ana_faaliyet_konusu TEXT[],
        resim_url TEXT,
        markalar TEXT[],
        marka_text TEXT[],
        urunler TEXT[],
        seo_title TEXT,
        seo_description TEXT,
        seo_slug TEXT UNIQUE,
        seo_index INTEGER,
        aktif BOOLEAN DEFAULT true,
        airtable_modified TIMESTAMP,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cloudinary_url TEXT,
        cloudinary_public_id TEXT
      )
    `;
    
    // Add new columns if they don't exist (for existing tables)
    await sql`
      ALTER TABLE hizmetler 
      ADD COLUMN IF NOT EXISTS cloudinary_url TEXT,
      ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT
    `.catch(() => {
      // Ignore error if columns already exist
    });
    
    // Get all services from Airtable
    const hizmetler = await getHizmetler();
    
    if (hizmetler.length === 0) {
      console.log('No services found in Airtable');
      return {
        success: true,
        count: 0,
        message: 'No services to sync',
      };
    }
    
    // Sync each service to database
    let syncedCount = 0;
    for (const hizmet of hizmetler) {
      try {
        // Get the first attachment URL if available
        const resimUrl = hizmet.fields['Resim']?.[0]?.url || null;
        
        await sql`
          INSERT INTO hizmetler (
            id,
            hizmet_adi,
            aciklama,
            kategori,
            ana_faaliyet_konusu,
            resim_url,
            markalar,
            marka_text,
            urunler,
            seo_title,
            seo_description,
            seo_slug,
            seo_index,
            airtable_modified,
            synced_at
          ) VALUES (
            ${hizmet.id},
            ${hizmet.fields['Hizmet Adı'] || null},
            ${hizmet.fields['Açıklama'] || null},
            ${hizmet.fields['Kategori'] || null},
            ${hizmet.fields['Ana Faaliyet Konusu'] || []},
            ${resimUrl},
            ${hizmet.fields['Markalar'] || []},
            ${hizmet.fields['Marka Text'] || []},
            ${hizmet.fields['Ürünler'] || []},
            ${hizmet.fields['SEO:Title'] || null},
            ${hizmet.fields['SEO:Description'] || null},
            ${hizmet.fields['SEO:Slug'] || null},
            ${hizmet.fields['SEO:Index'] || 999},
            ${hizmet.fields['Last Modified'] || null},
            ${new Date().toISOString()}
          )
          ON CONFLICT (id)
          DO UPDATE SET
            hizmet_adi = EXCLUDED.hizmet_adi,
            aciklama = EXCLUDED.aciklama,
            kategori = EXCLUDED.kategori,
            ana_faaliyet_konusu = EXCLUDED.ana_faaliyet_konusu,
            resim_url = EXCLUDED.resim_url,
            markalar = EXCLUDED.markalar,
            marka_text = EXCLUDED.marka_text,
            urunler = EXCLUDED.urunler,
            seo_title = EXCLUDED.seo_title,
            seo_description = EXCLUDED.seo_description,
            seo_slug = EXCLUDED.seo_slug,
            seo_index = EXCLUDED.seo_index,
            airtable_modified = EXCLUDED.airtable_modified,
            updated_at = CURRENT_TIMESTAMP,
            synced_at = EXCLUDED.synced_at
            -- cloudinary_url ve cloudinary_public_id alanlarına dokunmuyoruz
        `;
        
        syncedCount++;
        console.log(`Synced service: ${hizmet.fields['Hizmet Adı']} (${hizmet.id})`);
      } catch (error) {
        console.error(`Error syncing service ${hizmet.id}:`, error);
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
        'airtable.hizmetler.synced',
        'integration',
        'success',
        ${JSON.stringify({
          totalRecords: hizmetler.length,
          syncedCount,
          timestamp: new Date().toISOString(),
        })},
        ${JSON.stringify({
          source: 'manual_sync',
          table: AIRTABLE_TABLE_ID_HIZMETLER,
        })}
      )
    `;
    
    console.log(`Successfully synced ${syncedCount} out of ${hizmetler.length} services`);
    
    return {
      success: true,
      count: syncedCount,
      total: hizmetler.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error syncing Hizmetler to Neon:', error);
    
    // Log the error
    await sql`
      INSERT INTO event_logs (
        event_name,
        event_type,
        status,
        payload,
        metadata
      ) VALUES (
        'airtable.hizmetler.sync_failed',
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

// Get Hizmetler from Neon database
export async function getHizmetlerFromNeon() {
  try {
    const result = await sql`
      SELECT 
        id,
        hizmet_adi,
        aciklama,
        kategori,
        ana_faaliyet_konusu,
        resim_url,
        cloudinary_url,
        cloudinary_public_id,
        markalar,
        marka_text,
        urunler,
        seo_title,
        seo_description,
        seo_slug,
        slug,
        seo_index,
        aktif,
        synced_at,
        updated_at
      FROM hizmetler
      WHERE aktif = true
      ORDER BY seo_index ASC, hizmet_adi ASC
    `;
    
    return result;
  } catch (error) {
    console.error('Error fetching Hizmetler from Neon:', error);
    throw error;
  }
}