import { sql } from './db';
import { Urun } from './types/urun';

export async function getUrunlerByHizmetIdFromNeon(hizmetId: string): Promise<Urun[]> {
  try {
    const result = await sql`
      SELECT
        u.id,
        u.urun_adi,
        u.slug,
        u.aciklama,
        u.kisa_aciklama,
        u.resim_url,
        u.cloudinary_url,
        u.kategori,
        u.marka_id,
        u.aktif,
        u.created_time,
        u.updated_time,
        m.marka_adi,
        m.logo_url
      FROM urunler u
      LEFT JOIN markalar m ON u.marka_id = m.id
      WHERE u.hizmet_id = ${hizmetId} AND u.aktif = true
      ORDER BY u.urun_adi
    `;

    return result as Urun[];
  } catch (error) {
    console.error('Error fetching urunler by hizmet id from Neon:', error);
    return [];
  }
}

export async function getUrunlerFromNeon(): Promise<Urun[]> {
  try {
    const result = await sql`
      SELECT
        u.id,
        u.urun_adi,
        u.slug,
        u.aciklama,
        u.kisa_aciklama,
        u.resim_url,
        u.cloudinary_url,
        u.kategori,
        u.marka_id,
        u.hizmet_id,
        u.aktif,
        u.created_time,
        u.updated_time,
        m.marka_adi,
        m.logo_url
      FROM urunler u
      LEFT JOIN markalar m ON u.marka_id = m.id
      WHERE u.aktif = true
      ORDER BY u.urun_adi
    `;

    return result as Urun[];
  } catch (error) {
    console.error('Error fetching urunler from Neon:', error);
    return [];
  }
}