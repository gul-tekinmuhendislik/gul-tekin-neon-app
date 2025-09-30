import { sql } from './db';
import { Urun } from './types/urun';

export async function getUrunlerByHizmetIdFromNeon(hizmetId: string): Promise<Urun[]> {
  try {
    const result = await sql`
      SELECT
        id,
        urun_adi,
        slug,
        aciklama,
        marka,
        gorsel_url,
        cloudinary_url,
        stokta,
        hizmet_id,
        created_time,
        updated_time
      FROM urunler
      WHERE hizmet_id = ${hizmetId}
      ORDER BY urun_adi
    `;

    return result as Urun[];
  } catch (error) {
    console.error('Error fetching urunler from Neon:', error);
    return [];
  }
}

export async function getUrunById(id: string): Promise<Urun | null> {
  try {
    const result = await sql`
      SELECT
        id,
        urun_adi,
        slug,
        aciklama,
        marka,
        gorsel_url,
        cloudinary_url,
        stokta,
        hizmet_id,
        created_time,
        updated_time
      FROM urunler
      WHERE id = ${id}
      LIMIT 1
    `;

    return result[0] as Urun || null;
  } catch (error) {
    console.error('Error fetching urun by id from Neon:', error);
    return null;
  }
}
