import { sql } from '../lib/db';

async function checkBrandSlugs() {
  try {
    const result = await sql`
      SELECT marka_adi, slug, cloudinary_url
      FROM markalar
      WHERE marka_adi IN ('Varmeks', 'Solimpeks')
        AND aktif = true
    `;

    console.log('Brand slugs:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkBrandSlugs();
