import { sql } from './db';
import { Hizmet } from './types/hizmet';

/**
 * Get all hizmetler (services) from the Neon database
 * @returns Promise<Hizmet[]>
 */
export async function getHizmetlerFromNeon(): Promise<Hizmet[]> {
  try {
    const result = await sql`
      SELECT
        id,
        hizmet_adi,
        aciklama,
        kategori,
        ana_faaliyet_konusu,
        resim_url,
        cloudinary_url,
        cloudinary_public_id,
        markalar,
        marka_text,
        urunler,
        seo_title,
        seo_description,
        slug,
        seo_index,
        aktif,
        airtable_modified,
        synced_at,
        updated_at
      FROM hizmetler
      WHERE aktif = true
      ORDER BY seo_index ASC, hizmet_adi ASC
    `;

    return result.map((row) => ({
      id: row.id,
      hizmet_adi: row.hizmet_adi,
      aciklama: row.aciklama,
      kategori: row.kategori,
      ana_faaliyet_konusu: row.ana_faaliyet_konusu || [],
      resim_url: row.resim_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      markalar: row.markalar || [],
      marka_text: row.marka_text || [],
      urunler: row.urunler || [],
      seo_title: row.seo_title,
      seo_description: row.seo_description,
      slug: row.slug,
      seo_index: row.seo_index,
      created_at: row.synced_at,
      updated_at: row.updated_at,
    })) as Hizmet[];
  } catch (error) {
    console.error('Error fetching hizmetler from Neon:', error);
    throw error;
  }
}

/**
 * Get a single hizmet by ID from the Neon database
 * @param id - The hizmet ID
 * @returns Promise<Hizmet | null>
 */
export async function getHizmetByIdFromNeon(id: string): Promise<Hizmet | null> {
  try {
    const result = await sql`
      SELECT
        id,
        hizmet_adi,
        aciklama,
        kategori,
        ana_faaliyet_konusu,
        resim_url,
        cloudinary_url,
        cloudinary_public_id,
        markalar,
        marka_text,
        urunler,
        seo_title,
        seo_description,
        slug,
        seo_index,
        aktif,
        airtable_modified,
        synced_at,
        updated_at
      FROM hizmetler
      WHERE id = ${id} AND aktif = true
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      hizmet_adi: row.hizmet_adi,
      aciklama: row.aciklama,
      kategori: row.kategori,
      ana_faaliyet_konusu: row.ana_faaliyet_konusu || [],
      resim_url: row.resim_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      markalar: row.markalar || [],
      marka_text: row.marka_text || [],
      urunler: row.urunler || [],
      seo_title: row.seo_title,
      seo_description: row.seo_description,
      slug: row.slug,
      seo_index: row.seo_index,
      created_at: row.synced_at,
      updated_at: row.updated_at,
    } as Hizmet;
  } catch (error) {
    console.error('Error fetching hizmet by ID from Neon:', error);
    throw error;
  }
}

/**
 * Get hizmetler by category from the Neon database
 * @param kategori - The category name
 * @returns Promise<Hizmet[]>
 */
export async function getHizmetlerByCategoryFromNeon(kategori: string): Promise<Hizmet[]> {
  try {
    const result = await sql`
      SELECT
        id,
        hizmet_adi,
        aciklama,
        kategori,
        ana_faaliyet_konusu,
        resim_url,
        cloudinary_url,
        cloudinary_public_id,
        markalar,
        marka_text,
        urunler,
        seo_title,
        seo_description,
        slug,
        seo_index,
        aktif,
        airtable_modified,
        synced_at,
        updated_at
      FROM hizmetler
      WHERE kategori = ${kategori} AND aktif = true
      ORDER BY seo_index ASC, hizmet_adi ASC
    `;

    return result.map((row) => ({
      id: row.id,
      hizmet_adi: row.hizmet_adi,
      aciklama: row.aciklama,
      kategori: row.kategori,
      ana_faaliyet_konusu: row.ana_faaliyet_konusu || [],
      resim_url: row.resim_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      markalar: row.markalar || [],
      marka_text: row.marka_text || [],
      urunler: row.urunler || [],
      seo_title: row.seo_title,
      seo_description: row.seo_description,
      slug: row.slug,
      seo_index: row.seo_index,
      created_at: row.synced_at,
      updated_at: row.updated_at,
    })) as Hizmet[];
  } catch (error) {
    console.error('Error fetching hizmetler by category from Neon:', error);
    throw error;
  }
}