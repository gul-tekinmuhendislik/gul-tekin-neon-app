import { sql } from "./db";

interface Brand {
  id: number;
  marka_adi: string;
  yetkili_servis: boolean;
}

export async function getRandomBrands(limit: number = 6): Promise<string[]> {
  try {
    const result = await sql`
      SELECT marka_adi 
      FROM markalar 
      WHERE aktif = true 
        AND marka_adi IS NOT NULL
      ORDER BY RANDOM() 
      LIMIT ${limit}
    ` as Brand[];
    
    return result.map(brand => brand.marka_adi);
  } catch (error) {
    console.error("Error fetching random brands:", error);
    // Fallback brands if database query fails
    return [
      "Daikin",
      "Mitsubishi", 
      "Bosch",
      "Vaillant",
      "Viessmann",
      "Alarko"
    ];
  }
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