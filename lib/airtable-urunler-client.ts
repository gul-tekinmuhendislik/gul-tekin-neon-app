import Airtable from 'airtable';
import { sql } from '@/lib/db';

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_URUNLER = process.env.AIRTABLE_TABLE_ID_URUNLER || 'Urunler';

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

// Type definition for Urun record based on actual Airtable schema
export interface UrunRecord {
  id?: string;
  fields: {
    'Ürün Adı'?: string;
    'Ürün Kategorisi'?: string;
    'Açıklama'?: string;
    'Peşin Fiyat'?: number;
    'Hacim (Ton)'?: number;
    'Depo Tipi'?: string;
    'Assets'?: Array<{ url: string; filename: string; type?: string }>;
    'Markalar'?: string[];
    'Marka Text'?: string[];
    'Ana faaliyet Konusu'?: string[];
    'Hizmet Kategorisi'?: string[];
    'SEO:Title'?: string;
    'SEO:Description'?: string;
    'SEO:Slug'?: string;
    'Created'?: string;
    'Güncelleme'?: string;
    'fiyat_arastirmasi'?: string;
    'Blog'?: string[];
  };
}

// Get all Urunler from Airtable
export async function getUrunler() {
  try {
    const base = getAirtableBase();
    const records: UrunRecord[] = [];
    
    console.log(`Fetching from table: ${AIRTABLE_TABLE_ID_URUNLER}`);
    
    await base(AIRTABLE_TABLE_ID_URUNLER)
      .select({
        view: "Grid view", // Default view
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          records.push({
            id: record.id,
            fields: record.fields as UrunRecord['fields'],
          });
        });
        fetchNextPage();
      });
    
    console.log(`Fetched ${records.length} products from Airtable`);
    return records;
  } catch (error) {
    console.error('Error fetching Urunler from Airtable:', error);
    throw error;
  }
}

// Get active Urunler only
export async function getActiveUrunler() {
  try {
    const base = getAirtableBase();
    const records: UrunRecord[] = [];
    
    await base(AIRTABLE_TABLE_ID_URUNLER)
      .select({
        view: "Grid view",
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          records.push({
            id: record.id,
            fields: record.fields as UrunRecord['fields'],
          });
        });
        fetchNextPage();
      });
    
    return records;
  } catch (error) {
    console.error('Error fetching active Urunler from Airtable:', error);
    throw error;
  }
}

// Sync Urunler to Neon database
export async function syncUrunlerToNeon() {
  try {
    console.log('Starting Urunler sync to Neon database...');
    
    // First, create the table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS urunler (
        id TEXT PRIMARY KEY,
        urun_adi TEXT,
        slug TEXT,
        aciklama TEXT,
        fiyat DECIMAL(10,2),
        kategori TEXT,
        marka TEXT,
        sku TEXT,
        stokta BOOLEAN DEFAULT true,
        etiketler TEXT[], 
        gorsel_url TEXT,
        aktif BOOLEAN DEFAULT true,
        siralama_no INTEGER,
        ozellikler TEXT,
        agirlik DECIMAL(8,2),
        boyutlar TEXT,
        airtable_created_time TIMESTAMP,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cloudinary_url TEXT,
        cloudinary_public_id TEXT
      )
    `;
    
    // Add new columns if they don't exist (for existing tables)
    await sql`
      ALTER TABLE urunler 
      ADD COLUMN IF NOT EXISTS slug TEXT,
      ADD COLUMN IF NOT EXISTS sku TEXT,
      ADD COLUMN IF NOT EXISTS etiketler TEXT[],
      ADD COLUMN IF NOT EXISTS ozellikler TEXT,
      ADD COLUMN IF NOT EXISTS agirlik DECIMAL(8,2),
      ADD COLUMN IF NOT EXISTS boyutlar TEXT,
      ADD COLUMN IF NOT EXISTS cloudinary_url TEXT,
      ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT
    `.catch(() => {
      // Ignore error if columns already exist
    });
    
    // Get all products from Airtable
    const urunler = await getUrunler();
    
    if (urunler.length === 0) {
      console.log('No products found in Airtable');
      return {
        success: true,
        count: 0,
        message: 'No products to sync',
      };
    }
    
    // Sync each product to database
    let syncedCount = 0;
    for (const urun of urunler) {
      try {
        // Get the first attachment URL if available
        const gorselUrl = urun.fields.Assets?.[0]?.url || null;
        
        await sql`
          INSERT INTO urunler (
            id,
            urun_adi,
            slug,
            aciklama,
            fiyat,
            kategori,
            marka,
            sku,
            stokta,
            etiketler,
            gorsel_url,
            aktif,
            siralama_no,
            ozellikler,
            agirlik,
            boyutlar,
            airtable_created_time,
            synced_at
          ) VALUES (
            ${urun.id},
            ${urun.fields['Ürün Adı'] || null},
            ${urun.fields['SEO:Slug'] || null},
            ${urun.fields['Açıklama'] || null},
            ${urun.fields['Peşin Fiyat'] || null},
            ${urun.fields['Ürün Kategorisi'] || null},
            ${urun.fields['Marka Text']?.[0] || null},
            ${null}, 
            ${true},
            ${null},
            ${gorselUrl},
            ${true},
            ${999},
            ${null},
            ${urun.fields['Hacim (Ton)'] || null},
            ${urun.fields['Depo Tipi'] || null},
            ${urun.fields['Created'] || null},
            ${new Date().toISOString()}
          )
          ON CONFLICT (id)
          DO UPDATE SET
            urun_adi = EXCLUDED.urun_adi,
            slug = EXCLUDED.slug,
            aciklama = EXCLUDED.aciklama,
            fiyat = EXCLUDED.fiyat,
            kategori = EXCLUDED.kategori,
            marka = EXCLUDED.marka,
            sku = EXCLUDED.sku,
            stokta = EXCLUDED.stokta,
            etiketler = EXCLUDED.etiketler,
            gorsel_url = EXCLUDED.gorsel_url,
            aktif = EXCLUDED.aktif,
            siralama_no = EXCLUDED.siralama_no,
            ozellikler = EXCLUDED.ozellikler,
            agirlik = EXCLUDED.agirlik,
            boyutlar = EXCLUDED.boyutlar,
            airtable_created_time = EXCLUDED.airtable_created_time,
            updated_at = CURRENT_TIMESTAMP,
            synced_at = EXCLUDED.synced_at
        `;
        
        syncedCount++;
        console.log(`Synced product: ${urun.fields['Ürün Adı']} (${urun.id}) - Category: ${urun.fields['Ürün Kategorisi'] || 'N/A'}, Price: ${urun.fields['Peşin Fiyat'] || 'N/A'}`);
      } catch (error) {
        console.error(`Error syncing product ${urun.id}:`, error);
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
        'airtable.urunler.synced',
        'integration',
        'success',
        ${JSON.stringify({
          totalRecords: urunler.length,
          syncedCount,
          timestamp: new Date().toISOString(),
        })},
        ${JSON.stringify({
          source: 'manual_sync',
          table: AIRTABLE_TABLE_ID_URUNLER,
        })}
      )
    `;
    
    console.log(`Successfully synced ${syncedCount} out of ${urunler.length} products`);
    
    return {
      success: true,
      count: syncedCount,
      total: urunler.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error syncing Urunler to Neon:', error);
    
    // Log the error
    await sql`
      INSERT INTO event_logs (
        event_name,
        event_type,
        status,
        payload,
        metadata
      ) VALUES (
        'airtable.urunler.sync_failed',
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

// Get Urunler from Neon database
export async function getUrunlerFromNeon() {
  try {
    const result = await sql`
      SELECT 
        id,
        urun_adi,
        slug,
        aciklama,
        fiyat,
        kategori,
        marka,
        sku,
        stokta,
        etiketler,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        aktif,
        siralama_no,
        ozellikler,
        agirlik,
        boyutlar,
        synced_at,
        updated_at
      FROM urunler
      WHERE aktif = true
      ORDER BY siralama_no ASC, urun_adi ASC
    `;
    
    return result;
  } catch (error) {
    console.error('Error fetching Urunler from Neon:', error);
    throw error;
  }
}