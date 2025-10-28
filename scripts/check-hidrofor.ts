import { sql } from '../lib/db';

async function checkHidrofor() {
  console.log('Checking hidrofor service...\n');

  // Search for hidrofor in different ways
  const allHizmetler = await sql`
    SELECT slug, hizmet_adi, kategori, aktif
    FROM hizmetler
    WHERE LOWER(hizmet_adi) LIKE '%hidrofor%' OR slug LIKE '%hidrofor%'
    ORDER BY hizmet_adi
  `;

  console.log(`Found ${allHizmetler.length} services matching 'hidrofor':`);
  allHizmetler.forEach((h: any) => {
    console.log(`  - ${h.hizmet_adi} (slug: ${h.slug}, kategori: ${h.kategori}, aktif: ${h.aktif})`);
  });

  // Check if hidrofor slug exists
  const hidroforSlug = await sql`
    SELECT *
    FROM hizmetler
    WHERE slug = 'hidrofor'
  `;

  if (hidroforSlug.length > 0) {
    console.log('\n\nHidrofor slug exists:');
    console.log(hidroforSlug[0]);
  } else {
    console.log('\n\nNo service with slug "hidrofor" found.');
    console.log('This might be a 404 issue - the page does not exist in database.');
  }
}

checkHidrofor()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
