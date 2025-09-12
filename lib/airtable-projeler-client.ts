import Airtable from 'airtable';
import { sql } from '@/lib/db';

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_PROJELER = process.env.AIRTABLE_TABLE_ID_PROJELER || 'Projeler';

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

// Type definition for Proje record
export interface ProjeRecord {
  id?: string;
  fields: {
    'Proje Adı'?: string;
    'SEO:slug'?: string;
    'Açıklama'?: string;
    'Mahalle Adı'?: string;
    'İlçe Adı'?: string;
    'Proje Başlangıç Tarihi'?: string;
    'Proje Bitiş Tarihi'?: string;
    'Proje Yılı'?: string;
    'Ana faaliyet Konusu'?: string[];
    'Resimler'?: Array<{ id?: string; url: string; filename: string; width?: number; height?: number; size?: number; type?: string }>;
    'Last Modified'?: string;
  };
}

// Get all Projeler from Airtable
export async function getAllProjeler() {
  try {
    const base = getAirtableBase();
    const records: ProjeRecord[] = [];

    await base(AIRTABLE_TABLE_ID_PROJELER)
      .select({
        view: 'Grid view',
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach((record) => {
          records.push({
            id: record.id,
            fields: record.fields as ProjeRecord['fields'],
          });
        });
        fetchNextPage();
      });

    return records;
  } catch (error) {
    console.error('Error fetching projeler from Airtable:', error);
    throw error;
  }
}

// Get Proje by ID
export async function getProjeById(recordId: string): Promise<ProjeRecord | null> {
  try {
    const base = getAirtableBase();
    const record = await base(AIRTABLE_TABLE_ID_PROJELER).find(recordId);
    
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      fields: record.fields as ProjeRecord['fields'],
    };
  } catch (error) {
    console.error(`Error fetching proje ${recordId} from Airtable:`, error);
    return null;
  }
}

// Sync Projeler from Airtable to Neon database
export async function syncProjelerToNeon() {
  try {
    const records = await getAllProjeler();
    let syncedCount = 0;

    for (const record of records) {
      if (!record.id) continue;

      const { fields } = record;
      
      // Process images
      const mainImage = fields['Resimler']?.[0]?.url || null;
      const galleryImages = fields['Resimler']?.map(img => img.url) || [];
      
      // Generate unique slug
      let slug = fields['SEO:slug'] || fields['Proje Adı']?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
      
      // Ensure slug is unique by appending airtable id if needed
      if (slug) {
        const existingSlug = await sql`
          SELECT id FROM projeler WHERE slug = ${slug} AND airtable_id != ${record.id}
        `;
        if (existingSlug.length > 0) {
          slug = `${slug}-${record.id.substring(0, 6)}`;
        }
      }

      // Check if record exists
      const existing = await sql`
        SELECT id FROM projeler WHERE airtable_id = ${record.id}
      `;

      if (existing.length > 0) {
        // Update existing record - sadece Airtable'dan gelen alanları güncelle
        await sql`
          UPDATE projeler SET
            isim = ${fields['Proje Adı'] || ''},
            slug = ${slug},
            aciklama = ${fields['Açıklama'] || ''},
            musteri = ${fields['Mahalle Adı'] || ''},
            konum = ${fields['İlçe Adı'] || ''},
            tarih = ${fields['Proje Başlangıç Tarihi'] || null},
            resim_url = ${mainImage},
            kategori = ${fields['Ana faaliyet Konusu']?.[0] || ''},
            hizmetler = ${fields['Ana faaliyet Konusu'] || []},
            markalar = ${[]},
            durum = 'Tamamlandı',
            onemli = false,
            galeri = ${galleryImages},
            etiketler = ${[fields['Proje Yılı']].filter(Boolean)},
            aktif = true,
            sira = 0,
            guncelleme_tarihi = NOW()
            -- cloudinary_url, cloudinary_public_id ve diğer ekstra alanlara dokunmuyoruz
          WHERE airtable_id = ${record.id}
        `;
      } else {
        // Insert new record
        await sql`
          INSERT INTO projeler (
            airtable_id,
            isim,
            slug,
            aciklama,
            musteri,
            konum,
            tarih,
            resim_url,
            kategori,
            hizmetler,
            markalar,
            durum,
            onemli,
            galeri,
            etiketler,
            aktif,
            sira,
            olusturma_tarihi,
            guncelleme_tarihi
          ) VALUES (
            ${record.id},
            ${fields['Proje Adı'] || ''},
            ${slug},
            ${fields['Açıklama'] || ''},
            ${fields['Mahalle Adı'] || ''},
            ${fields['İlçe Adı'] || ''},
            ${fields['Proje Başlangıç Tarihi'] || null},
            ${mainImage},
            ${fields['Ana faaliyet Konusu']?.[0] || ''},
            ${fields['Ana faaliyet Konusu'] || []},
            ${[]},
            'Tamamlandı',
            false,
            ${galleryImages},
            ${[fields['Proje Yılı']].filter(Boolean)},
            true,
            0,
            ${fields['Last Modified'] || 'NOW()'},
            NOW()
          )
        `;
      }

      syncedCount++;
    }

    console.log(`Synced ${syncedCount} projeler to Neon database`);
    
    return {
      success: true,
      count: syncedCount,
      total: records.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error syncing projeler to Neon:', error);
    throw error;
  }
}

// Update a single proje in Airtable
export async function updateProjeInAirtable(recordId: string, fields: Partial<ProjeRecord['fields']>) {
  try {
    const base = getAirtableBase();
    // @ts-expect-error - Airtable types are not fully compatible with our custom fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedRecord = await base(AIRTABLE_TABLE_ID_PROJELER).update(recordId, fields) as any;
    
    return {
      id: updatedRecord.id,
      fields: updatedRecord.fields as ProjeRecord['fields'],
    };
  } catch (error) {
    console.error(`Error updating proje ${recordId} in Airtable:`, error);
    throw error;
  }
}