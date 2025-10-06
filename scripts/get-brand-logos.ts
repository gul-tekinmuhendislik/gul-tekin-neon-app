import { sql } from '@/lib/db';

async function getBrandLogos() {
  try {
    const result = await sql`
      SELECT
        marka_adi,
        COALESCE(cloudinary_url, logo_url) as logo
      FROM markalar
      WHERE marka_adi ILIKE '%varmek%' OR marka_adi ILIKE '%solimpeks%'
    `;

    console.log('Brand logos:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

getBrandLogos();
