import { sql } from './db';
import { Hizmet } from './types/hizmet';

export async function getHizmetlerFromNeon(): Promise<Hizmet[]> {
  try {
    const result = await sql`
      SELECT
        id,
        hizmet_adi,
        slug,
        seo_slug,
        aciklama,
        seo_title,
        seo_description,
        marka_text,
        resim_url,
        cloudinary_url,
        aktif,
        created_time,
        updated_time
      FROM hizmetler
      WHERE aktif = true
      ORDER BY hizmet_adi
    `;

    return result as Hizmet[];
  } catch (error) {
    console.error('Error fetching hizmetler from Neon:', error);
    return [];
  }
}

export async function getHizmetById(id: string): Promise<Hizmet | null> {
  try {
    const result = await sql`
      SELECT
        id,
        hizmet_adi,
        slug,
        seo_slug,
        aciklama,
        seo_title,
        seo_description,
        marka_text,
        resim_url,
        cloudinary_url,
        aktif,
        created_time,
        updated_time
      FROM hizmetler
      WHERE id = ${id} AND aktif = true
      LIMIT 1
    `;

    return result[0] as Hizmet || null;
  } catch (error) {
    console.error('Error fetching hizmet by id from Neon:', error);
    return null;
  }
}