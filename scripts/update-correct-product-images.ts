import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local") });
const sql = neon(process.env.DATABASE_URL!);

async function updateProductImages() {
  console.log("Updating products with correct images...\n");

  // SILENT POOL products
  const silentPoolImage = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515962/gul-tekin/varmeks/varmeks-silent-pool-1.png";

  await sql`
    UPDATE urunler
    SET cloudinary_url = ${silentPoolImage}
    WHERE urun_adi LIKE '%SILENT POOL%'
  `;
  console.log("✓ Updated SILENT POOL products");

  // COMMERCIAL POOL products
  const commercialPoolImage = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515965/gul-tekin/varmeks/varmeks-commercial-pool-1.png";

  await sql`
    UPDATE urunler
    SET cloudinary_url = ${commercialPoolImage}
    WHERE urun_adi LIKE '%COMMERCIAL POOL%'
  `;
  console.log("✓ Updated COMMERCIAL POOL products");

  // COMMERCIAL DUO products
  const commercialDuoImage = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515968/gul-tekin/varmeks/varmeks-commercial-duo-1.png";

  await sql`
    UPDATE urunler
    SET cloudinary_url = ${commercialDuoImage}
    WHERE urun_adi LIKE '%COMMERCIAL DUO%'
  `;
  console.log("✓ Updated COMMERCIAL DUO products");

  // VARM ALL (hot water tank) products
  const allSeriesImage = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515969/gul-tekin/varmeks/varmeks-all-series-1.png";

  await sql`
    UPDATE urunler
    SET cloudinary_url = ${allSeriesImage}
    WHERE urun_adi LIKE '%VARM ALL%'
  `;
  console.log("✓ Updated VARM ALL products");

  // Verify updates
  console.log("\n=== Verification ===\n");

  const silentPool = await sql`SELECT urun_adi FROM urunler WHERE urun_adi LIKE '%SILENT POOL%'`;
  console.log(`SILENT POOL: ${silentPool.length} products`);

  const commercialPool = await sql`SELECT urun_adi FROM urunler WHERE urun_adi LIKE '%COMMERCIAL POOL%'`;
  console.log(`COMMERCIAL POOL: ${commercialPool.length} products`);

  const commercialDuo = await sql`SELECT urun_adi FROM urunler WHERE urun_adi LIKE '%COMMERCIAL DUO%'`;
  console.log(`COMMERCIAL DUO: ${commercialDuo.length} products`);

  const allSeries = await sql`SELECT urun_adi FROM urunler WHERE urun_adi LIKE '%VARM ALL%'`;
  console.log(`VARM ALL: ${allSeries.length} products`);

  console.log("\n✅ All products updated with correct images!");
}

updateProductImages();
