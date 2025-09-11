require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');
const { neon } = require('@neondatabase/serverless');
const cloudinary = require('cloudinary').v2;

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_PROJELER = process.env.AIRTABLE_TABLE_ID_PROJELER || 'Projeler';
const DATABASE_URL = process.env.DATABASE_URL || '';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

const base = Airtable.base(AIRTABLE_BASE_ID);
const sql = neon(DATABASE_URL);

async function uploadToCloudinary(imageUrl, publicId) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: 'projeler-gul-tekin',
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
    console.error(`   ✗ Cloudinary error for ${publicId}:`, error.message);
    return null;
  }
}

async function syncAllProjects(limit = 10) {
  console.log(`Starting sync for ${limit} projects with Cloudinary upload...\n`);
  
  try {
    // Get records from Airtable
    console.log('1. Fetching records from Airtable...');
    const records = [];
    
    await base(AIRTABLE_TABLE_ID_PROJELER)
      .select({
        maxRecords: limit,
        view: 'Grid view',
      })
      .eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach((record) => {
          records.push(record);
        });
        if (records.length < limit) {
          fetchNextPage();
        }
      });
    
    console.log(`   Found ${records.length} records\n`);
    
    let successCount = 0;
    let cloudinaryCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const fields = record.fields;
      
      console.log(`\n[${i + 1}/${records.length}] Processing: ${fields['Proje Adı']}`);
      
      try {
        // Prepare data
        const slug = fields['SEO:slug'] || 
                    fields['Proje Adı']?.toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '') || 
                    `proje-${record.id.substring(0, 6)}`;
        
        const resimler = fields['Resimler'] || [];
        const airtableResimUrl = resimler[0]?.url || null;
        const airtableGaleriUrls = resimler.map(img => img.url);
        
        // Check if already has Cloudinary URL
        const existing = await sql`
          SELECT cloudinary_url 
          FROM projeler_gul_tekin 
          WHERE airtable_id = ${record.id}
        `;
        
        let cloudinaryUrl = existing[0]?.cloudinary_url || null;
        let cloudinaryPublicId = null;
        let cloudinaryGaleriUrls = [];
        let cloudinaryGaleriPublicIds = [];
        
        // Upload to Cloudinary if needed
        if (!cloudinaryUrl && airtableResimUrl) {
          console.log('   Uploading to Cloudinary...');
          const publicId = `proje-${slug}-${record.id.substring(0, 6)}`;
          const cloudinaryResult = await uploadToCloudinary(airtableResimUrl, publicId);
          
          if (cloudinaryResult) {
            cloudinaryUrl = cloudinaryResult.url;
            cloudinaryPublicId = cloudinaryResult.publicId;
            cloudinaryCount++;
            console.log('   ✓ Uploaded main image');
            
            // Upload gallery (max 2 for performance)
            const galleryLimit = Math.min(resimler.length, 2);
            for (let j = 0; j < galleryLimit; j++) {
              const galleryPublicId = `${publicId}-galeri-${j + 1}`;
              const galleryResult = await uploadToCloudinary(
                resimler[j].url,
                galleryPublicId
              );
              
              if (galleryResult) {
                cloudinaryGaleriUrls.push(galleryResult.url);
                cloudinaryGaleriPublicIds.push(galleryResult.publicId);
              }
            }
            if (galleryLimit > 0) {
              console.log(`   ✓ Uploaded ${cloudinaryGaleriUrls.length} gallery images`);
            }
          }
        } else if (cloudinaryUrl) {
          console.log('   ⚡ Already has Cloudinary URL');
        } else {
          console.log('   ⚠️ No images to upload');
        }
        
        // Update database
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
            cloudinary_galeri_urls = CASE 
              WHEN EXCLUDED.cloudinary_galeri_urls = '{}' THEN projeler_gul_tekin.cloudinary_galeri_urls
              ELSE EXCLUDED.cloudinary_galeri_urls
            END,
            cloudinary_galeri_public_ids = CASE 
              WHEN EXCLUDED.cloudinary_galeri_public_ids = '{}' THEN projeler_gul_tekin.cloudinary_galeri_public_ids
              ELSE EXCLUDED.cloudinary_galeri_public_ids
            END,
            airtable_last_modified = EXCLUDED.airtable_last_modified,
            updated_at = NOW(),
            synced_at = NOW()
        `;
        
        successCount++;
        console.log('   ✓ Synced to database');
        
      } catch (error) {
        errorCount++;
        console.error(`   ✗ Error: ${error.message}`);
      }
    }
    
    // Final stats
    console.log('\n' + '='.repeat(50));
    console.log('SYNC SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Total Records: ${records.length}`);
    console.log(`Successfully Synced: ${successCount}`);
    console.log(`New Cloudinary Uploads: ${cloudinaryCount}`);
    console.log(`Errors: ${errorCount}`);
    
    // Database stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(cloudinary_url) as with_cloudinary,
        COUNT(airtable_resim_url) as with_airtable_image
      FROM projeler_gul_tekin
    `;
    
    console.log('\nDatabase Statistics:');
    console.log(`Total Projects: ${stats[0].total}`);
    console.log(`With Cloudinary URL: ${stats[0].with_cloudinary}`);
    console.log(`With Airtable Image: ${stats[0].with_airtable_image}`);
    
    console.log('\n✅ Sync completed!');
    
  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
    console.error('Error details:', error.message);
  }
}

// Get limit from command line argument
const limit = parseInt(process.argv[2]) || 10;
syncAllProjects(limit);