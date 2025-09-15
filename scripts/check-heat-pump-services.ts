import { sql } from '@/lib/db';

async function checkHeatPumpServices() {
  try {
    console.log('Checking heat pump services in database...\n');

    // Get all services that might be heat pump related
    const result = await sql`
      SELECT
        id,
        hizmet_adi,
        seo_slug,
        slug,
        kategori,
        aktif
      FROM hizmetler
      WHERE
        kategori ILIKE '%ısı pompa%'
        OR hizmet_adi ILIKE '%ısı pompa%'
        OR kategori ILIKE '%heat pump%'
        OR hizmet_adi ILIKE '%heat pump%'
      ORDER BY seo_index, hizmet_adi
    `;

    console.log(`Found ${result.length} heat pump related services:\n`);

    result.forEach((service: any, index: number) => {
      console.log(`${index + 1}. ${service.hizmet_adi}`);
      console.log(`   ID: ${service.id}`);
      console.log(`   Kategori: ${service.kategori || 'N/A'}`);
      console.log(`   SEO Slug: ${service.seo_slug || 'NULL'}`);
      console.log(`   Slug: ${service.slug || 'NULL'}`);
      console.log(`   Aktif: ${service.aktif}`);
      console.log(`   URL would be: /hizmetler/${service.slug || service.seo_slug || 'NO-SLUG'}`);

      if (!service.slug && !service.seo_slug) {
        console.log(`   ⚠️  WARNING: No slug found for this service!`);
      }
      console.log('');
    });

    // Check for any services without slugs
    const noSlugResult = await sql`
      SELECT
        id,
        hizmet_adi,
        kategori
      FROM hizmetler
      WHERE
        (seo_slug IS NULL OR seo_slug = '')
        AND (slug IS NULL OR slug = '')
        AND aktif = true
    `;

    if (noSlugResult.length > 0) {
      console.log(`\n⚠️  Found ${noSlugResult.length} active services WITHOUT any slug:`);
      noSlugResult.forEach((service: any) => {
        console.log(`   - ${service.hizmet_adi} (${service.kategori || 'No category'})`);
      });
    }

  } catch (error) {
    console.error('Error checking services:', error);
  } finally {
    process.exit(0);
  }
}

checkHeatPumpServices();