require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');
const { neon } = require('@neondatabase/serverless');
const cloudinary = require('cloudinary').v2;

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const DATABASE_URL = process.env.DATABASE_URL || '';

// Configure
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
    console.error(`Cloudinary upload error: ${error.message}`);
    return null;
  }
}

async function syncCompleteProject(record) {
  const fields = record.fields;
  console.log(`\nProcessing: ${fields['Proje Adı']}`);
  
  // 1. Prepare all data first
  const slug = fields['SEO:slug'] || 
              fields['Proje Adı']?.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '') || 
              `proje-${record.id.substring(0, 6)}`;
  
  const resimler = fields['Resimler'] || [];
  const airtableResimUrl = resimler[0]?.url || null;
  const airtableGaleriUrls = resimler.map(img => img.url);
  
  // 2. Upload to Cloudinary FIRST
  let cloudinaryUrl = null;
  let cloudinaryPublicId = null;
  let cloudinaryGaleriUrls = [];
  let cloudinaryGaleriPublicIds = [];
  
  if (airtableResimUrl) {
    console.log('  📤 Uploading main image to Cloudinary...');
    const publicId = `proje-${slug}-${record.id.substring(0, 6)}`;
    const cloudinaryResult = await uploadToCloudinary(airtableResimUrl, publicId);
    
    if (cloudinaryResult) {
      cloudinaryUrl = cloudinaryResult.url;
      cloudinaryPublicId = cloudinaryResult.publicId;
      console.log('  ✅ Main image uploaded');
      
      // Upload gallery images (max 2 for now)
      const galleryLimit = Math.min(resimler.length, 2);
      for (let i = 0; i < galleryLimit; i++) {
        console.log(`  📤 Uploading gallery image ${i + 1}...`);
        const galleryPublicId = `${publicId}-galeri-${i + 1}`;
        const galleryResult = await uploadToCloudinary(resimler[i].url, galleryPublicId);
        
        if (galleryResult) {
          cloudinaryGaleriUrls.push(galleryResult.url);
          cloudinaryGaleriPublicIds.push(galleryResult.publicId);
          console.log(`  ✅ Gallery image ${i + 1} uploaded`);
        }
      }
    } else {
      console.log('  ⚠️ Cloudinary upload failed - will save without Cloudinary');
    }
  } else {
    console.log('  ℹ️ No images to upload');
  }
  
  // 3. Now save EVERYTHING to database
  console.log('  💾 Saving to database with all fields...');
  
  try {
    const result = await sql`
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
        created_at,
        updated_at,
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
        NOW(),
        NOW(),
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
          WHEN array_length(EXCLUDED.cloudinary_galeri_urls, 1) > 0 
          THEN EXCLUDED.cloudinary_galeri_urls
          ELSE projeler_gul_tekin.cloudinary_galeri_urls
        END,
        cloudinary_galeri_public_ids = CASE 
          WHEN array_length(EXCLUDED.cloudinary_galeri_public_ids, 1) > 0 
          THEN EXCLUDED.cloudinary_galeri_public_ids
          ELSE projeler_gul_tekin.cloudinary_galeri_public_ids
        END,
        airtable_last_modified = EXCLUDED.airtable_last_modified,
        updated_at = NOW(),
        synced_at = NOW()
      RETURNING id, proje_adi, cloudinary_url
    `;
    
    if (result.length > 0) {
      console.log('  ✅ Saved to database successfully');
      console.log(`     DB ID: ${result[0].id}`);
      console.log(`     Cloudinary: ${result[0].cloudinary_url ? 'YES' : 'NO'}`);
    }
    
    return true;
  } catch (error) {
    console.error(`  ❌ Database error: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting complete sync with Cloudinary-first approach...\n');
    
    // Get records from Airtable
    const limit = parseInt(process.argv[2]) || 5;
    console.log(`📋 Fetching ${limit} records from Airtable...`);
    
    const records = await base('Projeler').select({
      maxRecords: limit,
      view: 'Grid view'
    }).all();
    
    console.log(`✅ Found ${records.length} records`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each record
    for (const record of records) {
      const success = await syncCompleteProject(record);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    // Final statistics
    console.log('\n' + '='.repeat(80));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total: ${records.length}`);
    
    // Database statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(cloudinary_url) as with_cloudinary,
        COUNT(airtable_resim_url) as with_airtable,
        COUNT(aciklama) as with_description,
        COUNT(mahalle) as with_mahalle,
        COUNT(ilce) as with_ilce,
        COUNT(proje_yili) as with_year
      FROM projeler_gul_tekin
    `;
    
    console.log('\n📈 Database Statistics:');
    console.log(`   Total Records: ${stats[0].total}`);
    console.log(`   With Cloudinary: ${stats[0].with_cloudinary}`);
    console.log(`   With Airtable Image: ${stats[0].with_airtable}`);
    console.log(`   With Description: ${stats[0].with_description}`);
    console.log(`   With Mahalle: ${stats[0].with_mahalle}`);
    console.log(`   With İlçe: ${stats[0].with_ilce}`);
    console.log(`   With Year: ${stats[0].with_year}`);
    
    // Show sample record with all fields
    console.log('\n📄 Sample Complete Record:');
    const sample = await sql`
      SELECT * FROM projeler_gul_tekin 
      WHERE cloudinary_url IS NOT NULL 
      LIMIT 1
    `;
    
    if (sample.length > 0) {
      const record = sample[0];
      console.log(`   Proje: ${record.proje_adi}`);
      console.log(`   Slug: ${record.slug}`);
      console.log(`   Mahalle: ${record.mahalle || 'N/A'}`);
      console.log(`   İlçe: ${record.ilce || 'N/A'}`);
      console.log(`   Year: ${record.proje_yili || 'N/A'}`);
      console.log(`   Has Description: ${record.aciklama ? 'YES' : 'NO'}`);
      console.log(`   Has Cloudinary: ${record.cloudinary_url ? 'YES' : 'NO'}`);
      console.log(`   Gallery Images: ${record.cloudinary_galeri_urls?.length || 0}`);
    }
    
    console.log('\n✨ Sync completed!\n');
    
  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
    console.error('Details:', error.message);
  }
}

// Run with: node complete-sync-projeler.js [limit]
// Example: node complete-sync-projeler.js 10
main();