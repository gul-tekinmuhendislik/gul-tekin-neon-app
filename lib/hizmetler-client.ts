import { sql } from './db';
import { Hizmet } from './types/hizmet';

export async function getHizmetlerFromNeon(): Promise<Hizmet[]> {
  try {
    const result = await sql`
      SELECT
        id,
        hizmet_adi,
        slug,
        aciklama,
        kategori,
        resim_url,
        cloudinary_url,
        marka_text,
        ana_faaliyet_konusu,
        urunler,
        seo_title,
        seo_description,
        seo_slug,
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
        aciklama,
        kategori,
        resim_url,
        cloudinary_url,
        marka_text,
        ana_faaliyet_konusu,
        urunler,
        seo_title,
        seo_description,
        seo_slug,
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
