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

async function main() {
  try {
    console.log('Starting simple sync...\n');
    
    // Get 3 records
    const records = await base('Projeler').select({
      maxRecords: 3,
      view: 'Grid view'
    }).all();
    
    console.log(`Found ${records.length} records\n`);
    
    for (const record of records) {
      const fields = record.fields;
      console.log(`Processing: ${fields['Proje Adı']}`);
      
      // Get image URL
      const resimUrl = fields['Resimler']?.[0]?.url || null;
      
      let cloudinaryUrl = null;
      let cloudinaryPublicId = null;
      
      // Upload to Cloudinary if image exists
      if (resimUrl) {
        try {
          const slug = fields['Proje Adı']?.toLowerCase().replace(/\s+/g, '-') || 'proje';
          const publicId = `proje-${slug}-${record.id.substring(0, 6)}`;
          
          console.log('  Uploading to Cloudinary...');
          const result = await cloudinary.uploader.upload(resimUrl, {
            public_id: publicId,
            folder: 'projeler-gul-tekin',
            overwrite: true
          });
          
          cloudinaryUrl = result.secure_url;
          cloudinaryPublicId = result.public_id;
          console.log('  ✓ Uploaded to Cloudinary');
        } catch (err) {
          console.log('  ✗ Cloudinary error:', err.message);
        }
      }
      
      // Save to database
      try {
        await sql`
          INSERT INTO projeler_gul_tekin (
            airtable_id,
            proje_adi,
            slug,
            mahalle,
            ilce,
            airtable_resim_url,
            cloudinary_url,
            cloudinary_public_id
          ) VALUES (
            ${record.id},
            ${fields['Proje Adı'] || ''},
            ${fields['Proje Adı']?.toLowerCase().replace(/\s+/g, '-') || ''},
            ${fields['Mahalle Adı'] || null},
            ${fields['İlçe Adı'] || null},
            ${resimUrl},
            ${cloudinaryUrl},
            ${cloudinaryPublicId}
          )
          ON CONFLICT (airtable_id)
          DO UPDATE SET
            cloudinary_url = EXCLUDED.cloudinary_url,
            cloudinary_public_id = EXCLUDED.cloudinary_public_id,
            updated_at = NOW()
        `;
        console.log('  ✓ Saved to database');
      } catch (err) {
        console.log('  ✗ Database error:', err.message);
      }
      
      console.log('');
    }
    
    // Check results
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(cloudinary_url) as with_cloudinary
      FROM projeler_gul_tekin
    `;
    
    console.log('Results:');
    console.log(`Total in DB: ${stats[0].total}`);
    console.log(`With Cloudinary: ${stats[0].with_cloudinary}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();