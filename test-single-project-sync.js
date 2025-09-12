require('dotenv').config({ path: '.env.local' });
const Airtable = require('airtable');
const { neon } = require('@neondatabase/serverless');

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID_PROJELER = process.env.AIRTABLE_TABLE_ID_PROJELER || 'Projeler';
const DATABASE_URL = process.env.DATABASE_URL || '';

Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

const base = Airtable.base(AIRTABLE_BASE_ID);
const sql = neon(DATABASE_URL);

async function syncSingleProject() {
  console.log('Starting single project sync test...\n');
  
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
    console.log('   Mahalle:', fields['Mahalle Adı']);
    console.log('   İlçe:', fields['İlçe Adı']);
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
    console.log('   Gallery URLs:', airtableGaleriUrls.length);
    
    // Insert to database
    console.log('\n4. Inserting to Neon database...');
    
    const insertQuery = `
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
        aktif,
        sira,
        airtable_last_modified,
        synced_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, NOW()
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
        airtable_last_modified = EXCLUDED.airtable_last_modified,
        updated_at = NOW(),
        synced_at = NOW()
      RETURNING id, proje_adi, slug, cloudinary_url
    `;
    
    const values = [
      record.id,                                    // airtable_id
      fields['Proje Adı'] || '',                   // proje_adi
      slug,                                         // slug
      fields['Açıklama'] || null,                  // aciklama
      fields['Mahalle Adı'] || null,               // mahalle
      fields['İlçe Adı'] || null,                  // ilce
      fields['Proje Başlangıç Tarihi'] || null,    // baslangic_tarihi
      fields['Proje Bitiş Tarihi'] || null,        // bitis_tarihi
      fields['Proje Yılı'] || null,                // proje_yili
      fields['Ana faaliyet Konusu'] || [],         // ana_faaliyet_konusu
      airtableResimUrl,                             // airtable_resim_url
      airtableGaleriUrls,                           // airtable_galeri_urls
      null,                                         // cloudinary_url (will be updated later)
      null,                                         // cloudinary_public_id (will be updated later)
      true,                                         // aktif
      999,                                          // sira
      fields['Last Modified'] || null,             // airtable_last_modified
    ];
    
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
        ${null},
        ${null},
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
        airtable_last_modified = EXCLUDED.airtable_last_modified,
        updated_at = NOW(),
        synced_at = NOW()
      RETURNING id, proje_adi, slug, cloudinary_url
    `;
    
    console.log('\n5. Database Insert Result:');
    console.log('   Success:', result.length > 0);
    if (result.length > 0) {
      console.log('   Database ID:', result[0].id);
      console.log('   Proje Adı:', result[0].proje_adi);
      console.log('   Slug:', result[0].slug);
    }
    
    // Verify the record
    console.log('\n6. Verifying record in database...');
    
    const verifyResult = await sql`
      SELECT 
        id,
        airtable_id,
        proje_adi,
        slug,
        airtable_resim_url,
        cloudinary_url,
        created_at,
        updated_at
      FROM projeler_gul_tekin
      WHERE airtable_id = ${record.id}
    `;
    
    if (verifyResult.length > 0) {
      console.log('   ✓ Record found in database');
      console.log('   Database details:');
      console.log('     - ID:', verifyResult[0].id);
      console.log('     - Airtable ID:', verifyResult[0].airtable_id);
      console.log('     - Proje Adı:', verifyResult[0].proje_adi);
      console.log('     - Slug:', verifyResult[0].slug);
      console.log('     - Has Airtable Image:', !!verifyResult[0].airtable_resim_url);
      console.log('     - Has Cloudinary URL:', !!verifyResult[0].cloudinary_url);
      console.log('     - Created:', verifyResult[0].created_at);
    } else {
      console.log('   ✗ Record NOT found in database');
    }
    
    // Count total records
    const countResult = await sql`SELECT COUNT(*) as count FROM projeler_gul_tekin`;
    console.log('\n7. Total records in projeler_gul_tekin table:', countResult[0].count);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

syncSingleProject();