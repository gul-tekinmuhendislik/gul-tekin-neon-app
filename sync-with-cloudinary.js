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
    console.log(`   Uploading to Cloudinary with public_id: ${publicId}`);
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
    
    console.log(`   ✓ Uploaded successfully: ${result.secure_url}`);
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('   ✗ Cloudinary upload error:', error.message);
    return null;
  }
}

async function syncProjectWithCloudinary() {
  console.log('Starting project sync with Cloudinary upload...\n');
  
  try {
    // Get first record from Airtable
    console.log('1. Fetching first record from Airtable...');
    const records = await base(AIRTABLE_TABLE_ID_PROJELER)
      .select({
        maxRecords: 1,
        view: 'Grid view',
      })
      .firstPage();
    
    if (records.length === 0) {
      console.log('No records found in Airtable');
      return;
    }
    
    const record = records[0];
    const fields = record.fields;
    
    console.log('\n2. Airtable Record Found:');
    console.log('   ID:', record.id);
    console.log('   Proje Adı:', fields['Proje Adı']);
    console.log('   Resimler:', fields['Resimler']?.length || 0, 'adet');
    
    // Prepare data
    const slug = fields['SEO:slug'] || 
                fields['Proje Adı']?.toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '') || 
                `proje-${record.id.substring(0, 6)}`;
    
    const resimler = fields['Resimler'] || [];
    const airtableResimUrl = resimler[0]?.url || null;
    const airtableGaleriUrls = resimler.map(img => img.url);
    
    console.log('\n3. Prepared Data:');
    console.log('   Slug:', slug);
    console.log('   Main Image URL:', airtableResimUrl ? 'YES' : 'NO');
    
    // Upload to Cloudinary
    let cloudinaryUrl = null;
    let cloudinaryPublicId = null;
    let cloudinaryGaleriUrls = [];
    let cloudinaryGaleriPublicIds = [];
    
    if (airtableResimUrl) {
      console.log('\n4. Uploading to Cloudinary...');
      const publicId = `proje-${slug}-${record.id.substring(0, 6)}`;
      const cloudinaryResult = await uploadToCloudinary(airtableResimUrl, publicId);
      
      if (cloudinaryResult) {
        cloudinaryUrl = cloudinaryResult.url;
        cloudinaryPublicId = cloudinaryResult.publicId;
        
        // Upload gallery images (max 3)
        console.log('\n5. Uploading gallery images...');
        const galleryLimit = Math.min(resimler.length, 3);
        for (let i = 0; i < galleryLimit; i++) {
          const galleryPublicId = `${publicId}-galeri-${i + 1}`;
          const galleryResult = await uploadToCloudinary(
            resimler[i].url,
            galleryPublicId
          );
          
          if (galleryResult) {
            cloudinaryGaleriUrls.push(galleryResult.url);
            cloudinaryGaleriPublicIds.push(galleryResult.publicId);
          }
        }
      }
    } else {
      console.log('\n4. No images to upload to Cloudinary');
    }
    
    // Insert/Update to database
    console.log('\n6. Updating database with Cloudinary URLs...');
    
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
        cloudinary_url = EXCLUDED.cloudinary_url,
        cloudinary_public_id = EXCLUDED.cloudinary_public_id,
        cloudinary_galeri_urls = EXCLUDED.cloudinary_galeri_urls,
        cloudinary_galeri_public_ids = EXCLUDED.cloudinary_galeri_public_ids,
        airtable_last_modified = EXCLUDED.airtable_last_modified,
        updated_at = NOW(),
        synced_at = NOW()
      RETURNING id, proje_adi, slug, cloudinary_url, cloudinary_public_id
    `;
    
    console.log('\n7. Database Update Result:');
    if (result.length > 0) {
      console.log('   ✓ Success');
      console.log('   Database ID:', result[0].id);
      console.log('   Proje Adı:', result[0].proje_adi);
      console.log('   Cloudinary URL:', result[0].cloudinary_url || 'NULL');
      console.log('   Cloudinary Public ID:', result[0].cloudinary_public_id || 'NULL');
    }
    
    // Verify the record
    console.log('\n8. Verifying record in database...');
    
    const verifyResult = await sql`
      SELECT 
        id,
        airtable_id,
        proje_adi,
        slug,
        airtable_resim_url,
        cloudinary_url,
        cloudinary_public_id,
        cloudinary_galeri_urls,
        created_at,
        updated_at
      FROM projeler_gul_tekin
      WHERE airtable_id = ${record.id}
    `;
    
    if (verifyResult.length > 0) {
      console.log('   ✓ Record verified in database');
      console.log('   Database details:');
      console.log('     - ID:', verifyResult[0].id);
      console.log('     - Proje Adı:', verifyResult[0].proje_adi);
      console.log('     - Has Airtable Image:', !!verifyResult[0].airtable_resim_url);
      console.log('     - Has Cloudinary URL:', !!verifyResult[0].cloudinary_url);
      console.log('     - Cloudinary URL:', verifyResult[0].cloudinary_url || 'NULL');
      console.log('     - Cloudinary Public ID:', verifyResult[0].cloudinary_public_id || 'NULL');
      console.log('     - Gallery URLs:', verifyResult[0].cloudinary_galeri_urls?.length || 0);
    }
    
    console.log('\n✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

syncProjectWithCloudinary();