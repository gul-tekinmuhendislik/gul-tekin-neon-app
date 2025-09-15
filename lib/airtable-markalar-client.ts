import { sql } from './db';

export interface Marka {
  id: string;
  marka_adi: string;
  logo_url?: string;
  cloudinary_url?: string;
  cloudinary_public_id?: string;
  website?: string;
  url?: string;
  email?: string;
  kategori?: string;
  aciklama?: string;
  yetkili_servis?: boolean;
  aktif?: boolean;
  siralama_no?: number;
  slug?: string;
  airtable_created_time?: Date;
  synced_at?: Date;
  updated_at?: Date;
  airtable_hizmetler_id?: string[];
  airtable_faaliyet_id?: string[];
}

/**
 * Get all markalar (brands) from the Neon database
 * @returns Promise<Marka[]>
 */
export async function getMarkalarFromNeon(): Promise<Marka[]> {
  try {
    const result = await sql`
      SELECT
        id,
        marka_adi,
        logo_url,
        cloudinary_url,
        cloudinary_public_id,
        website,
        url,
        email,
        kategori,
        aciklama,
        yetkili_servis,
        aktif,
        siralama_no,
        slug,
        airtable_created_time,
        synced_at,
        updated_at,
        airtable_hizmetler_id,
        airtable_faaliyet_id
      FROM markalar
      WHERE aktif = true
      ORDER BY siralama_no ASC, marka_adi ASC
    `;

    return result.map((row) => ({
      id: row.id,
      marka_adi: row.marka_adi,
      logo_url: row.logo_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      website: row.website,
      url: row.url,
      email: row.email,
      kategori: row.kategori,
      aciklama: row.aciklama,
      yetkili_servis: row.yetkili_servis || false,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      slug: row.slug,
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
      airtable_hizmetler_id: row.airtable_hizmetler_id || [],
      airtable_faaliyet_id: row.airtable_faaliyet_id || [],
    })) as Marka[];
  } catch (error) {
    console.error('Error fetching markalar from Neon:', error);
    throw error;
  }
}

/**
 * Get a single marka by ID from the Neon database
 * @param id - The marka ID
 * @returns Promise<Marka | null>
 */
export async function getMarkaByIdFromNeon(id: string): Promise<Marka | null> {
  try {
    const result = await sql`
      SELECT
        id,
        marka_adi,
        logo_url,
        cloudinary_url,
        cloudinary_public_id,
        website,
        url,
        email,
        kategori,
        aciklama,
        yetkili_servis,
        aktif,
        siralama_no,
        slug,
        airtable_created_time,
        synced_at,
        updated_at,
        airtable_hizmetler_id,
        airtable_faaliyet_id
      FROM markalar
      WHERE id = ${id} AND aktif = true
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      marka_adi: row.marka_adi,
      logo_url: row.logo_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      website: row.website,
      url: row.url,
      email: row.email,
      kategori: row.kategori,
      aciklama: row.aciklama,
      yetkili_servis: row.yetkili_servis || false,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      slug: row.slug,
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
      airtable_hizmetler_id: row.airtable_hizmetler_id || [],
      airtable_faaliyet_id: row.airtable_faaliyet_id || [],
    } as Marka;
  } catch (error) {
    console.error('Error fetching marka by ID from Neon:', error);
    throw error;
  }
}

/**
 * Get markalar by category from the Neon database
 * @param kategori - The category name
 * @returns Promise<Marka[]>
 */
export async function getMarkalarByCategoryFromNeon(kategori: string): Promise<Marka[]> {
  try {
    const result = await sql`
      SELECT
        id,
        marka_adi,
        logo_url,
        cloudinary_url,
        cloudinary_public_id,
        website,
        url,
        email,
        kategori,
        aciklama,
        yetkili_servis,
        aktif,
        siralama_no,
        slug,
        airtable_created_time,
        synced_at,
        updated_at,
        airtable_hizmetler_id,
        airtable_faaliyet_id
      FROM markalar
      WHERE kategori = ${kategori} AND aktif = true
      ORDER BY siralama_no ASC, marka_adi ASC
    `;

    return result.map((row) => ({
      id: row.id,
      marka_adi: row.marka_adi,
      logo_url: row.logo_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      website: row.website,
      url: row.url,
      email: row.email,
      kategori: row.kategori,
      aciklama: row.aciklama,
      yetkili_servis: row.yetkili_servis || false,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      slug: row.slug,
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
      airtable_hizmetler_id: row.airtable_hizmetler_id || [],
      airtable_faaliyet_id: row.airtable_faaliyet_id || [],
    })) as Marka[];
  } catch (error) {
    console.error('Error fetching markalar by category from Neon:', error);
    throw error;
  }
}

/**
 * Get markalar that are yetkili servis (authorized service)
 * @returns Promise<Marka[]>
 */
export async function getYetkiliServisMarkalarFromNeon(): Promise<Marka[]> {
  try {
    const result = await sql`
      SELECT
        id,
        marka_adi,
        logo_url,
        cloudinary_url,
        cloudinary_public_id,
        website,
        url,
        email,
        kategori,
        aciklama,
        yetkili_servis,
        aktif,
        siralama_no,
        slug,
        airtable_created_time,
        synced_at,
        updated_at,
        airtable_hizmetler_id,
        airtable_faaliyet_id
      FROM markalar
      WHERE yetkili_servis = true AND aktif = true
      ORDER BY siralama_no ASC, marka_adi ASC
    `;

    return result.map((row) => ({
      id: row.id,
      marka_adi: row.marka_adi,
      logo_url: row.logo_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      website: row.website,
      url: row.url,
      email: row.email,
      kategori: row.kategori,
      aciklama: row.aciklama,
      yetkili_servis: row.yetkili_servis || false,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      slug: row.slug,
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
      airtable_hizmetler_id: row.airtable_hizmetler_id || [],
      airtable_faaliyet_id: row.airtable_faaliyet_id || [],
    })) as Marka[];
  } catch (error) {
    console.error('Error fetching yetkili servis markalar from Neon:', error);
    throw error;
  }
}