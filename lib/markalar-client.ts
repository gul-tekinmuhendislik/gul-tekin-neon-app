import { sql } from './db';
import { Marka } from './types/marka';

export async function getMarkalariNeon(): Promise<Marka[]> {
  try {
    const result = await sql`
      SELECT
        id,
        marka_adi,
        slug,
        aciklama,
        website,
        logo_url,
        cloudinary_url,
        kategori,
        aktif,
        yetkili_servis,
        airtable_created_time,
        updated_at
      FROM markalar
      WHERE aktif = true
      ORDER BY marka_adi
    `;

    return result as Marka[];
  } catch (error) {
    console.error('Error fetching markalar from Neon:', error);
    return [];
  }
}

export async function getMarkaById(id: string): Promise<Marka | null> {
  try {
    const result = await sql`
      SELECT
        id,
        marka_adi,
        slug,
        aciklama,
        website,
        logo_url,
        cloudinary_url,
        kategori,
        aktif,
        yetkili_servis,
        airtable_created_time,
        updated_at
      FROM markalar
      WHERE id = ${id} AND aktif = true
      LIMIT 1
    `;

    return result[0] as Marka || null;
  } catch (error) {
    console.error('Error fetching marka by id from Neon:', error);
    return null;
  }
}
