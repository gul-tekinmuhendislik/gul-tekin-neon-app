import { sql } from './db';

export interface Anafaaliyet {
  id: string;
  baslik: string;
  icerik?: string;
  kategori?: string;
  gorsel_url?: string;
  cloudinary_url?: string;
  cloudinary_public_id?: string;
  ozelik?: boolean;
  aktif?: boolean;
  siralama_no?: number;
  etiketler?: string[];
  airtable_created_time?: Date;
  synced_at?: Date;
  updated_at?: Date;
}

export interface AnafaaliyetSyncResult {
  count: number;
  total?: number;
  timestamp?: string;
}

/**
 * Placeholder function to get anafaaliyet data
 * Note: The anafaaliyet table doesn't exist in the current database schema
 * This function will need to be updated once the table is created
 * @returns Promise<Anafaaliyet[]>
 */
export async function getAnafaaliyetFromNeon(): Promise<Anafaaliyet[]> {
  try {
    // Check if anafaaliyet table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'anafaaliyet'
      )
    `;

    if (!tableExists[0].exists) {
      console.warn('anafaaliyet table does not exist in the database');
      return [];
    }

    const result = await sql`
      SELECT
        id,
        baslik,
        icerik,
        kategori,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        ozelik,
        aktif,
        siralama_no,
        etiketler,
        airtable_created_time,
        synced_at,
        updated_at
      FROM anafaaliyet
      WHERE aktif = true
      ORDER BY siralama_no ASC, baslik ASC
    `;

    return result.map((row) => ({
      id: row.id,
      baslik: row.baslik,
      icerik: row.icerik,
      kategori: row.kategori,
      gorsel_url: row.gorsel_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      ozelik: row.ozelik || false,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      etiketler: row.etiketler || [],
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
    })) as Anafaaliyet[];
  } catch (error) {
    console.error('Error fetching anafaaliyet from Neon:', error);
    // Return empty array instead of throwing to prevent breaking the app
    return [];
  }
}

/**
 * Get a single anafaaliyet by ID from the Neon database
 * @param id - The anafaaliyet ID
 * @returns Promise<Anafaaliyet | null>
 */
export async function getAnafaaliyetByIdFromNeon(id: string): Promise<Anafaaliyet | null> {
  try {
    // Check if anafaaliyet table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'anafaaliyet'
      )
    `;

    if (!tableExists[0].exists) {
      console.warn('anafaaliyet table does not exist in the database');
      return null;
    }

    const result = await sql`
      SELECT
        id,
        baslik,
        icerik,
        kategori,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        ozelik,
        aktif,
        siralama_no,
        etiketler,
        airtable_created_time,
        synced_at,
        updated_at
      FROM anafaaliyet
      WHERE id = ${id} AND aktif = true
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      baslik: row.baslik,
      icerik: row.icerik,
      kategori: row.kategori,
      gorsel_url: row.gorsel_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      ozelik: row.ozelik || false,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      etiketler: row.etiketler || [],
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
    } as Anafaaliyet;
  } catch (error) {
    console.error('Error fetching anafaaliyet by ID from Neon:', error);
    return null;
  }
}

/**
 * Placeholder sync function for anafaaliyet
 * This should be implemented with actual Airtable sync logic when needed
 * @returns Promise<AnafaaliyetSyncResult>
 */
export async function syncAnafaaliyetToNeon(): Promise<AnafaaliyetSyncResult> {
  // This is a placeholder implementation
  // In a real implementation, this would sync data from Airtable to Neon
  console.log('syncAnafaaliyetToNeon called - placeholder implementation');

  try {
    // Check if anafaaliyet table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'anafaaliyet'
      )
    `;

    if (!tableExists[0].exists) {
      console.warn('anafaaliyet table does not exist - sync skipped');
      return {
        count: 0,
        total: 0,
        timestamp: new Date().toISOString(),
      };
    }

    // Get current count for mock sync result
    const currentCount = await sql`SELECT COUNT(*) as count FROM anafaaliyet WHERE aktif = true`;
    const total = parseInt(currentCount[0].count);

    return {
      count: 0, // No new records synced in placeholder
      total: total,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in syncAnafaaliyetToNeon placeholder:', error);
    throw error;
  }
}

/**
 * Get anafaaliyet by category from the Neon database
 * @param kategori - The category name
 * @returns Promise<Anafaaliyet[]>
 */
export async function getAnafaaliyetByCategoryFromNeon(kategori: string): Promise<Anafaaliyet[]> {
  try {
    // Check if anafaaliyet table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'anafaaliyet'
      )
    `;

    if (!tableExists[0].exists) {
      console.warn('anafaaliyet table does not exist in the database');
      return [];
    }

    const result = await sql`
      SELECT
        id,
        baslik,
        icerik,
        kategori,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        ozelik,
        aktif,
        siralama_no,
        etiketler,
        airtable_created_time,
        synced_at,
        updated_at
      FROM anafaaliyet
      WHERE kategori = ${kategori} AND aktif = true
      ORDER BY siralama_no ASC, baslik ASC
    `;

    return result.map((row) => ({
      id: row.id,
      baslik: row.baslik,
      icerik: row.icerik,
      kategori: row.kategori,
      gorsel_url: row.gorsel_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      ozelik: row.ozelik || false,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      etiketler: row.etiketler || [],
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
    })) as Anafaaliyet[];
  } catch (error) {
    console.error('Error fetching anafaaliyet by category from Neon:', error);
    return [];
  }
}

/**
 * Get featured anafaaliyet from the Neon database
 * @returns Promise<Anafaaliyet[]>
 */
export async function getFeaturedAnafaaliyetFromNeon(): Promise<Anafaaliyet[]> {
  try {
    // Check if anafaaliyet table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'anafaaliyet'
      )
    `;

    if (!tableExists[0].exists) {
      console.warn('anafaaliyet table does not exist in the database');
      return [];
    }

    const result = await sql`
      SELECT
        id,
        baslik,
        icerik,
        kategori,
        gorsel_url,
        cloudinary_url,
        cloudinary_public_id,
        ozelik,
        aktif,
        siralama_no,
        etiketler,
        airtable_created_time,
        synced_at,
        updated_at
      FROM anafaaliyet
      WHERE ozelik = true AND aktif = true
      ORDER BY siralama_no ASC, baslik ASC
    `;

    return result.map((row) => ({
      id: row.id,
      baslik: row.baslik,
      icerik: row.icerik,
      kategori: row.kategori,
      gorsel_url: row.gorsel_url,
      cloudinary_url: row.cloudinary_url,
      cloudinary_public_id: row.cloudinary_public_id,
      ozelik: row.ozelik || false,
      aktif: row.aktif || true,
      siralama_no: row.siralama_no,
      etiketler: row.etiketler || [],
      airtable_created_time: row.airtable_created_time,
      synced_at: row.synced_at,
      updated_at: row.updated_at,
    })) as Anafaaliyet[];
  } catch (error) {
    console.error('Error fetching featured anafaaliyet from Neon:', error);
    return [];
  }
}