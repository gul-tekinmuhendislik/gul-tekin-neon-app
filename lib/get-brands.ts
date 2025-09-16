import { sql } from "./db";

interface Brand {
  id: number;
  marka_adi: string;
  yetkili_servis: boolean;
}

// Cache for brands to reduce database queries
let brandsCache: { data: string[] | null; timestamp: number } = {
  data: null,
  timestamp: 0
};

const CACHE_TTL = 60000; // 1 minute cache

export async function getRandomBrands(limit: number = 6): Promise<string[]> {
  // Check cache first
  const now = Date.now();
  if (brandsCache.data && (now - brandsCache.timestamp) < CACHE_TTL) {
    // Return random selection from cached brands
    const shuffled = [...brandsCache.data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  try {
    const result = await sql`
      SELECT marka_adi
      FROM markalar
      WHERE aktif = true
        AND marka_adi IS NOT NULL
    ` as Brand[];

    if (result.length > 0) {
      // Update cache
      brandsCache = {
        data: result.map(brand => brand.marka_adi),
        timestamp: now
      };

      // Return random selection
      const shuffled = [...(brandsCache.data || [])].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    }

    // Fall through to fallback
  } catch (error) {
    console.error("Error fetching random brands:", error);
  }

  // Fallback brands if database query fails
  const fallback = [
    "Daikin",
    "Mitsubishi",
    "Bosch",
    "Vaillant",
    "Viessmann",
    "Alarko"
  ];

  // Cache fallback data
  brandsCache = {
    data: fallback,
    timestamp: now
  };

  return fallback.slice(0, limit);
}

export async function getAuthorizedServiceBrands(limit: number = 6): Promise<string[]> {
  try {
    const result = await sql`
      SELECT marka_adi 
      FROM markalar 
      WHERE aktif = true 
        AND yetkili_servis = true
        AND marka_adi IS NOT NULL
      ORDER BY RANDOM() 
      LIMIT ${limit}
    ` as Brand[];
    
    if (result.length === 0) {
      // If no authorized service brands, get random brands
      return getRandomBrands(limit);
    }
    
    return result.map(brand => brand.marka_adi);
  } catch (error) {
    console.error("Error fetching authorized service brands:", error);
    // Fallback to random brands
    return getRandomBrands(limit);
  }
}