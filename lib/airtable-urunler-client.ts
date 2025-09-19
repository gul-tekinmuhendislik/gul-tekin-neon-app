import { sql } from './db';

export interface Urun {
  id: string;
  urun_adi: string;
  slug?: string;
  aciklama?: string;
  fiyat?: number;
  kategori?: string;
  marka?: string;
  sku?: string;
  stokta?: boolean;
  etiketler?: string[];
  gorsel_url?: string;
  cloudinary_url?: string;
  cloudinary_public_id?: string;
  aktif?: boolean;
  siralama_no?: number;
  ozellikler?: string;
  agirlik?: number;
  boyutlar?: string;
  hizmet_id?: string;
  hizmet_adi?: string;
  airtable_created_time?: Date;
  synced_at?: Date;
  updated_at?: Date;
}

export interface SyncResult {
  inserted: number;
  updated: number;
  total: number;
  timestamp: string;
}

/**
 * Get all urunler (products) from the Neon database
 * @returns Promise<Urun[]>
 */
export async function getUrunlerFromNeon(): Promise<Urun[]> {
  try {
    const result = await sql`
      SELECT
        id,
        urun_adi,
        slug,
        aciklama,
        fiyat,
        kategori,
        marka,
        sku,
        stokta,
        etiketler,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        aktif,
        siralama_no,
        ozellikler,
        agirlik,
        boyutlar,
        airtable_created_time,
        synced_at,
        updated_at
      FROM urunler
      WHERE aktif = true
      ORDER BY siralama_no ASC, urun_adi ASC
    `;

    return result.map((row) => ({
      id: row.id,
      urun_adi: row.urun_adi,
      slug: row.slug,
      aciklama: row.aciklama,
      fiyat: row.fiyat ? parseFloat(row.fiyat) : undefined,
      kategori: row.kategori,
      marka: row.marka,
      sku: row.sku,
      stokta: row.stokta || false,
      etiketler: row.etiketler || [],
      gorsel_url: row.gorsel_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      ozellikler: row.ozellikler,
      agirlik: row.agirlik ? parseFloat(row.agirlik) : undefined,
      boyutlar: row.boyutlar,
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
    })) as Urun[];
  } catch (error) {
    console.error('Error fetching urunler from Neon:', error);
    throw error;
  }
}

/**
 * Get a single urun by ID from the Neon database
 * @param id - The urun ID
 * @returns Promise<Urun | null>
 */
export async function getUrunByIdFromNeon(id: string): Promise<Urun | null> {
  try {
    const result = await sql`
      SELECT
        id,
        urun_adi,
        slug,
        aciklama,
        fiyat,
        kategori,
        marka,
        sku,
        stokta,
        etiketler,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        aktif,
        siralama_no,
        ozellikler,
        agirlik,
        boyutlar,
        airtable_created_time,
        synced_at,
        updated_at
      FROM urunler
      WHERE id = ${id} AND aktif = true
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      urun_adi: row.urun_adi,
      slug: row.slug,
      aciklama: row.aciklama,
      fiyat: row.fiyat ? parseFloat(row.fiyat) : undefined,
      kategori: row.kategori,
      marka: row.marka,
      sku: row.sku,
      stokta: row.stokta || false,
      etiketler: row.etiketler || [],
      gorsel_url: row.gorsel_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      ozellikler: row.ozellikler,
      agirlik: row.agirlik ? parseFloat(row.agirlik) : undefined,
      boyutlar: row.boyutlar,
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
    } as Urun;
  } catch (error) {
    console.error('Error fetching urun by ID from Neon:', error);
    throw error;
  }
}

/**
 * Get urunler by category from the Neon database
 * @param kategori - The category name
 * @returns Promise<Urun[]>
 */
export async function getUrunlerByCategoryFromNeon(kategori: string): Promise<Urun[]> {
  try {
    const result = await sql`
      SELECT
        id,
        urun_adi,
        slug,
        aciklama,
        fiyat,
        kategori,
        marka,
        sku,
        stokta,
        etiketler,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        aktif,
        siralama_no,
        ozellikler,
        agirlik,
        boyutlar,
        airtable_created_time,
        synced_at,
        updated_at
      FROM urunler
      WHERE kategori = ${kategori} AND aktif = true
      ORDER BY siralama_no ASC, urun_adi ASC
    `;

    return result.map((row) => ({
      id: row.id,
      urun_adi: row.urun_adi,
      slug: row.slug,
      aciklama: row.aciklama,
      fiyat: row.fiyat ? parseFloat(row.fiyat) : undefined,
      kategori: row.kategori,
      marka: row.marka,
      sku: row.sku,
      stokta: row.stokta || false,
      etiketler: row.etiketler || [],
      gorsel_url: row.gorsel_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      ozellikler: row.ozellikler,
      agirlik: row.agirlik ? parseFloat(row.agirlik) : undefined,
      boyutlar: row.boyutlar,
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
    })) as Urun[];
  } catch (error) {
    console.error('Error fetching urunler by category from Neon:', error);
    throw error;
  }
}

/**
 * Get urunler by hizmet_id from the Neon database
 * @param hizmetId - The service ID
 * @returns Promise<Urun[]>
 */
export async function getUrunlerByHizmetIdFromNeon(hizmetId: string): Promise<Urun[]> {
  try {
    const result = await sql`
      SELECT
        id,
        urun_adi,
        slug,
        aciklama,
        fiyat,
        kategori,
        marka,
        sku,
        stokta,
        etiketler,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        aktif,
        siralama_no,
        ozellikler,
        agirlik,
        boyutlar,
        hizmet_id,
        hizmet_adi,
        airtable_created_time,
        synced_at,
        updated_at
      FROM urunler
      WHERE hizmet_id = ${hizmetId} AND aktif = true
      ORDER BY siralama_no ASC, urun_adi ASC
      LIMIT 12
    `;

    return result.map((row) => ({
      id: row.id,
      urun_adi: row.urun_adi,
      slug: row.slug,
      aciklama: row.aciklama,
      fiyat: row.fiyat ? parseFloat(row.fiyat) : undefined,
      kategori: row.kategori,
      marka: row.marka,
      sku: row.sku,
      stokta: row.stokta || false,
      etiketler: row.etiketler || [],
      gorsel_url: row.gorsel_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      ozellikler: row.ozellikler,
      agirlik: row.agirlik ? parseFloat(row.agirlik) : undefined,
      boyutlar: row.boyutlar,
      hizmet_id: row.hizmet_id,
      hizmet_adi: row.hizmet_adi,
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
    })) as Urun[];
  } catch (error) {
    console.error('Error fetching urunler by hizmet_id from Neon:', error);
    throw error;
  }
}

/**
 * Get urunler by marka from the Neon database
 * @param marka - The brand name
 * @returns Promise<Urun[]>
 */
export async function getUrunlerByMarkaFromNeon(marka: string): Promise<Urun[]> {
  try {
    const result = await sql`
      SELECT
        id,
        urun_adi,
        slug,
        aciklama,
        fiyat,
        kategori,
        marka,
        sku,
        stokta,
        etiketler,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        aktif,
        siralama_no,
        ozellikler,
        agirlik,
        boyutlar,
        airtable_created_time,
        synced_at,
        updated_at
      FROM urunler
      WHERE marka = ${marka} AND aktif = true
      ORDER BY siralama_no ASC, urun_adi ASC
    `;

    return result.map((row) => ({
      id: row.id,
      urun_adi: row.urun_adi,
      slug: row.slug,
      aciklama: row.aciklama,
      fiyat: row.fiyat ? parseFloat(row.fiyat) : undefined,
      kategori: row.kategori,
      marka: row.marka,
      sku: row.sku,
      stokta: row.stokta || false,
      etiketler: row.etiketler || [],
      gorsel_url: row.gorsel_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      ozellikler: row.ozellikler,
      agirlik: row.agirlik ? parseFloat(row.agirlik) : undefined,
      boyutlar: row.boyutlar,
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
    })) as Urun[];
  } catch (error) {
    console.error('Error fetching urunler by marka from Neon:', error);
    throw error;
  }
}

/**
 * Get urunler that are in stock from the Neon database
 * @returns Promise<Urun[]>
 */
export async function getUrunlerInStockFromNeon(): Promise<Urun[]> {
  try {
    const result = await sql`
      SELECT
        id,
        urun_adi,
        slug,
        aciklama,
        fiyat,
        kategori,
        marka,
        sku,
        stokta,
        etiketler,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        aktif,
        siralama_no,
        ozellikler,
        agirlik,
        boyutlar,
        airtable_created_time,
        synced_at,
        updated_at
      FROM urunler
      WHERE stokta = true AND aktif = true
      ORDER BY siralama_no ASC, urun_adi ASC
    `;

    return result.map((row) => ({
      id: row.id,
      urun_adi: row.urun_adi,
      slug: row.slug,
      aciklama: row.aciklama,
      fiyat: row.fiyat ? parseFloat(row.fiyat) : undefined,
      kategori: row.kategori,
      marka: row.marka,
      sku: row.sku,
      stokta: row.stokta || false,
      etiketler: row.etiketler || [],
      gorsel_url: row.gorsel_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      ozellikler: row.ozellikler,
      agirlik: row.agirlik ? parseFloat(row.agirlik) : undefined,
      boyutlar: row.boyutlar,
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
    })) as Urun[];
  } catch (error) {
    console.error('Error fetching urunler in stock from Neon:', error);
    throw error;
  }
}

/**
 * Placeholder sync function for urunler
 * This should be implemented with actual Airtable sync logic when needed
 * @returns Promise<SyncResult>
 */
export async function syncUrunlerToNeon(): Promise<SyncResult> {
  // This is a placeholder implementation
  // In a real implementation, this would sync data from Airtable to Neon
  console.log('syncUrunlerToNeon called - placeholder implementation');

  try {
    // Get current count for mock sync result
    const currentCount = await sql`SELECT COUNT(*) as count FROM urunler WHERE aktif = true`;
    const total = parseInt(currentCount[0].count);

    return {
      inserted: 0,
      updated: 0,
      total: total,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in syncUrunlerToNeon placeholder:', error);
    throw error;
  }
}