import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

// Load .env.local first
config({ path: resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function checkImages() {
  console.log("Checking Varmeks and LG product images...\n");

  // Check Varmeks products
  const varmeksProducts = await sql`
    SELECT id, urun_adi, slug, cloudinary_url, stokta
    FROM urunler
    WHERE marka = 'Varmeks'
    ORDER BY urun_adi
    LIMIT 10
  `;

  console.log("=== VARMEKS PRODUCTS (First 10) ===\n");
  for (const product of varmeksProducts) {
    console.log(`${product.urun_adi}`);
    console.log(`  Stokta: ${product.stokta}`);
    console.log(`  URL: ${product.cloudinary_url || 'NO IMAGE'}`);
    console.log('');
  }

  // Check LG products
  const lgProducts = await sql`
    SELECT id, urun_adi, slug, cloudinary_url, stokta
    FROM urunler
    WHERE marka = 'LG'
    ORDER BY urun_adi
  `;

  console.log("\n=== LG PRODUCTS ===\n");
  for (const product of lgProducts) {
    console.log(`${product.urun_adi}`);
    console.log(`  Stokta: ${product.stokta}`);
    console.log(`  URL: ${product.cloudinary_url || 'NO IMAGE'}`);
    console.log('');
  }
}

checkImages();
