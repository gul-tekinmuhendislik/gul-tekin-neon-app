import { sql } from '../lib/db';

async function checkSlugs() {
  const result = await sql`
    SELECT id, marka_adi, slug, aktif
    FROM markalar
    WHERE aktif = true
    ORDER BY marka_adi
  `;

  console.log('Total active brands:', result.length);
  console.log('\nBrands WITHOUT slugs:');
  const withoutSlug = result.filter((m: any) => !m.slug);
  console.log('Count:', withoutSlug.length);
  withoutSlug.forEach((m: any) => console.log(`- ${m.marka_adi} (ID: ${m.id})`));

  console.log('\nBrands WITH slugs:');
  const withSlug = result.filter((m: any) => m.slug);
  console.log('Count:', withSlug.length);
  if (withSlug.length <= 10) {
    withSlug.forEach((m: any) => console.log(`- ${m.marka_adi} -> ${m.slug}`));
  }
}

checkSlugs().catch(console.error);
