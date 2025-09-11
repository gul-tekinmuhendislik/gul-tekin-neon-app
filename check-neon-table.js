require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || '';
const sql = neon(DATABASE_URL);

async function checkTable() {
  try {
    console.log('Checking projeler_gul_tekin table...\n');
    
    // Get sample records
    const records = await sql`
      SELECT 
        id,
        airtable_id,
        proje_adi,
        cloudinary_url,
        cloudinary_public_id,
        airtable_resim_url
      FROM projeler_gul_tekin
      ORDER BY id
      LIMIT 5
    `;
    
    console.log('Sample Records:');
    console.log('=' .repeat(80));
    
    records.forEach((record, index) => {
      console.log(`\n[${index + 1}] ${record.proje_adi}`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Airtable ID: ${record.airtable_id}`);
      console.log(`   Has Airtable Image: ${record.airtable_resim_url ? 'YES' : 'NO'}`);
      console.log(`   Has Cloudinary URL: ${record.cloudinary_url ? 'YES' : 'NO'}`);
      if (record.cloudinary_url) {
        console.log(`   Cloudinary URL: ${record.cloudinary_url.substring(0, 80)}...`);
        console.log(`   Public ID: ${record.cloudinary_public_id}`);
      }
    });
    
    // Get statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(airtable_resim_url) as with_airtable,
        COUNT(cloudinary_url) as with_cloudinary,
        COUNT(CASE WHEN cloudinary_url IS NOT NULL AND cloudinary_url != '' THEN 1 END) as non_empty_cloudinary
      FROM projeler_gul_tekin
    `;
    
    console.log('\n' + '=' .repeat(80));
    console.log('Table Statistics:');
    console.log(`Total Records: ${stats[0].total}`);
    console.log(`With Airtable Image: ${stats[0].with_airtable}`);
    console.log(`With Cloudinary URL: ${stats[0].with_cloudinary}`);
    console.log(`Non-empty Cloudinary: ${stats[0].non_empty_cloudinary}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTable();