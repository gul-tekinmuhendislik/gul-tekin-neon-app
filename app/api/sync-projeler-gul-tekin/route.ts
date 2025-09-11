import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import Airtable from 'airtable';
import { v2 as cloudinary } from 'cloudinary';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_PROJELER = process.env.AIRTABLE_TABLE_ID_PROJELER || 'Projeler';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

interface ProjeRecord {
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
    'Resimler'?: Array<{ 
      id?: string; 
      url: string; 
      filename: string; 
    }>;
    'Last Modified'?: string;
  };
}

async function uploadToCloudinary(imageUrl: string, folder: string, publicId: string) {
  try {
    console.log(`  Uploading to Cloudinary: ${publicId}`);
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: folder,
      resource_type: 'auto',
      overwrite: true,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('  Cloudinary upload error:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const uploadToCloud = searchParams.get('upload') !== 'false'; // Default true
    
    console.log(`Starting sync for projeler_gul_tekin (limit: ${limit}, upload: ${uploadToCloud})...`);
    
    // Fetch records from Airtable
    const base = Airtable.base(AIRTABLE_BASE_ID);
    const records: ProjeRecord[] = [];
    
    await base(AIRTABLE_TABLE_ID_PROJELER)
      .select({
        view: 'Grid view',
        maxRecords: limit,
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach((record) => {
          records.push({
            id: record.id,
            fields: record.fields as ProjeRecord['fields'],
          });
        });
        if (records.length < limit) {
          fetchNextPage();
        }
      });

    console.log(`Fetched ${records.length} projects from Airtable`);
    
    let syncedCount = 0;
    let cloudinaryUploadCount = 0;
    const results = [];

    for (const record of records) {
      if (!record.id) continue;
      
      const { fields } = record;
      console.log(`\nProcessing: ${fields['Proje Adı']}`);
      
      // Generate slug
      const slug = fields['SEO:slug'] || 
                  fields['Proje Adı']?.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '') || 
                  `proje-${record.id.substring(0, 6)}`;
      
      // Process images
      const resimler = fields['Resimler'] || [];
      const airtableResimUrl = resimler[0]?.url || null;
      const airtableGaleriUrls = resimler.map(img => img.url);
      
      let cloudinaryUrl = null;
      let cloudinaryPublicId = null;
      const cloudinaryGaleriUrls: string[] = [];
      const cloudinaryGaleriPublicIds: string[] = [];
      
      // Upload to Cloudinary if enabled and images exist
      if (uploadToCloud && airtableResimUrl) {
        const publicId = `proje-${slug}`;
        const cloudinaryResult = await uploadToCloudinary(
          airtableResimUrl, 
          'projeler-gul-tekin',
          publicId
        );
        
        if (cloudinaryResult) {
          cloudinaryUrl = cloudinaryResult.url;
          cloudinaryPublicId = cloudinaryResult.publicId;
          cloudinaryUploadCount++;
          console.log(`  ✓ Uploaded to Cloudinary`);
          
          // Upload gallery images (limit to first 3 for performance)
          const galleryLimit = Math.min(resimler.length, 3);
          for (let i = 0; i < galleryLimit; i++) {
            const galleryPublicId = `${publicId}-galeri-${i + 1}`;
            const galleryResult = await uploadToCloudinary(
              resimler[i].url,
              'projeler-gul-tekin/galeri',
              galleryPublicId
            );
            
            if (galleryResult) {
              cloudinaryGaleriUrls.push(galleryResult.url);
              cloudinaryGaleriPublicIds.push(galleryResult.publicId);
            }
          }
        }
      }
      
      // Insert or update in database
      try {
        await sql`
          INSERT INTO projeler_gul_tekin (
            airtable_id,
            proje_adi,
            slug,
            aciklama,
            mahalle,
            ilce,
            baslangic_tarihi,
            bitis_tarihi,
            proje_yili,
            ana_faaliyet_konusu,
            airtable_resim_url,
            airtable_galeri_urls,
            cloudinary_url,
            cloudinary_public_id,
            cloudinary_galeri_urls,
            cloudinary_galeri_public_ids,
            aktif,
            sira,
            airtable_last_modified,
            synced_at
          ) VALUES (
            ${record.id},
            ${fields['Proje Adı'] || ''},
            ${slug},
            ${fields['Açıklama'] || null},
            ${fields['Mahalle Adı'] || null},
            ${fields['İlçe Adı'] || null},
            ${fields['Proje Başlangıç Tarihi'] || null},
            ${fields['Proje Bitiş Tarihi'] || null},
            ${fields['Proje Yılı'] || null},
            ${fields['Ana faaliyet Konusu'] || []},
            ${airtableResimUrl},
            ${airtableGaleriUrls},
            ${cloudinaryUrl},
            ${cloudinaryPublicId},
            ${cloudinaryGaleriUrls},
            ${cloudinaryGaleriPublicIds},
            ${true},
            ${999},
            ${fields['Last Modified'] || null},
            NOW()
          )
          ON CONFLICT (airtable_id)
          DO UPDATE SET
            proje_adi = EXCLUDED.proje_adi,
            slug = EXCLUDED.slug,
            aciklama = EXCLUDED.aciklama,
            mahalle = EXCLUDED.mahalle,
            ilce = EXCLUDED.ilce,
            baslangic_tarihi = EXCLUDED.baslangic_tarihi,
            bitis_tarihi = EXCLUDED.bitis_tarihi,
            proje_yili = EXCLUDED.proje_yili,
            ana_faaliyet_konusu = EXCLUDED.ana_faaliyet_konusu,
            airtable_resim_url = EXCLUDED.airtable_resim_url,
            airtable_galeri_urls = EXCLUDED.airtable_galeri_urls,
            cloudinary_url = COALESCE(EXCLUDED.cloudinary_url, projeler_gul_tekin.cloudinary_url),
            cloudinary_public_id = COALESCE(EXCLUDED.cloudinary_public_id, projeler_gul_tekin.cloudinary_public_id),
            cloudinary_galeri_urls = COALESCE(EXCLUDED.cloudinary_galeri_urls, projeler_gul_tekin.cloudinary_galeri_urls),
            cloudinary_galeri_public_ids = COALESCE(EXCLUDED.cloudinary_galeri_public_ids, projeler_gul_tekin.cloudinary_galeri_public_ids),
            airtable_last_modified = EXCLUDED.airtable_last_modified,
            updated_at = NOW(),
            synced_at = NOW()
        `;
        
        syncedCount++;
        results.push({
          project: fields['Proje Adı'],
          slug: slug,
          hasCloudinary: !!cloudinaryUrl,
          cloudinaryUrl: cloudinaryUrl,
          galleryCount: cloudinaryGaleriUrls.length
        });
        
        console.log(`  ✓ Synced to database`);
      } catch (error) {
        console.error(`  ✗ Database error:`, error);
      }
    }
    
    // Get final stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(cloudinary_url) as with_cloudinary,
        COUNT(airtable_resim_url) as with_airtable_image,
        COUNT(NULLIF(cloudinary_url, '')) as non_empty_cloudinary
      FROM projeler_gul_tekin
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      results: {
        fetchedFromAirtable: records.length,
        syncedToDatabase: syncedCount,
        uploadedToCloudinary: cloudinaryUploadCount,
        projects: results,
        databaseStats: stats[0],
      },
    });
  } catch (error) {
    console.error('Error syncing projeler_gul_tekin:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}