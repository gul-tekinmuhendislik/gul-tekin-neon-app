require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixTurkishSlugs() {
  console.log('🔄 Fixing Turkish character slugs...');
  
  try {
    // Fix hizmetler slugs
    console.log('🔤 Fixing hizmetler slugs...');
    const hizmetler = await sql`
      SELECT id, hizmet_adi, slug
      FROM hizmetler 
      WHERE aktif = true AND hizmet_adi IS NOT NULL
    `;
    
    for (const hizmet of hizmetler) {
      let newSlug = hizmet.hizmet_adi
        ?.toLowerCase()
        .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
        .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      if (newSlug && newSlug !== hizmet.slug) {
        await sql`UPDATE hizmetler SET slug = ${newSlug} WHERE id = ${hizmet.id}`;
        console.log(`  ✓ ${hizmet.hizmet_adi}: ${hizmet.slug} → ${newSlug}`);
      }
    }
    
    // Fix urunler slugs
    console.log('🔤 Fixing urunler slugs...');
    const urunler = await sql`
      SELECT id, urun_adi, slug
      FROM urunler 
      WHERE aktif = true AND urun_adi IS NOT NULL
      LIMIT 50
    `;
    
    for (const urun of urunler) {
      let newSlug = urun.urun_adi
        ?.toLowerCase()
        .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
        .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-').replace(/^-|-$/g, '');
        
      if (newSlug && newSlug !== urun.slug) {
        // Check duplicates
        const existing = await sql`SELECT id FROM urunler WHERE slug = ${newSlug} AND id != ${urun.id}`;
        if (existing.length > 0) {
          newSlug = `${newSlug}-${urun.id}`;
        }
        
        await sql`UPDATE urunler SET slug = ${newSlug} WHERE id = ${urun.id}`;
        console.log(`  ✓ ${urun.urun_adi.substring(0,50)}... → ${newSlug}`);
      }
    }
    
    console.log('\n✅ Turkish character slugs fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixTurkishSlugs();