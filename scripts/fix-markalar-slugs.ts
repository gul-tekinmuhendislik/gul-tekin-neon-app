import { sql } from '../lib/db';

function generateSlug(text: string): string {
  const turkishMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  let slug = text;

  // Replace Turkish characters
  Object.keys(turkishMap).forEach(key => {
    slug = slug.replace(new RegExp(key, 'g'), turkishMap[key]);
  });

  // Convert to lowercase and replace spaces/special chars with hyphens
  slug = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
}

async function fixSlugs() {
  console.log('Fetching brands without slugs...');

  const brands = await sql`
    SELECT id, marka_adi, slug
    FROM markalar
    WHERE slug IS NULL OR slug = ''
    ORDER BY marka_adi
  `;

  console.log(`Found ${brands.length} brands without slugs\n`);

  for (const brand of brands) {
    const newSlug = generateSlug(brand.marka_adi);
    console.log(`${brand.marka_adi} -> ${newSlug}`);

    await sql`
      UPDATE markalar
      SET slug = ${newSlug}
      WHERE id = ${brand.id}
    `;
  }

  console.log(`\n✅ Updated ${brands.length} brand slugs successfully!`);

  // Verify
  console.log('\nVerifying...');
  const result = await sql`
    SELECT COUNT(*) as count
    FROM markalar
    WHERE aktif = true AND (slug IS NULL OR slug = '')
  `;

  console.log(`Brands still without slugs: ${result[0].count}`);
}

fixSlugs().catch(console.error);
