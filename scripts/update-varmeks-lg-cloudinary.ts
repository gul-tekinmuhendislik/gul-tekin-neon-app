import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

// Load .env.local first
config({ path: resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

// Cloudinary URLs for Varmeks and LG products
const VARMEKS_DEFAULT_IMAGE = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514994/gul-tekin/varmeks/varmeks-varm-up-series-1.png";
const LG_DEFAULT_IMAGE = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg";

async function updateProducts() {
  console.log("Updating Varmeks and LG products with Cloudinary URLs...\n");

  try {
    // Get all Varmeks products
    const varmeksProducts = await sql`
      SELECT id, urun_adi, slug, cloudinary_url
      FROM urunler
      WHERE marka = 'Varmeks'
      ORDER BY urun_adi
    `;

    console.log(`Found ${varmeksProducts.length} Varmeks products\n`);

    // Update Varmeks products - replace old URLs with new ones
    let varmeksUpdated = 0;
    for (const product of varmeksProducts) {
      // Determine which image to use based on product name
      let imageUrl = VARMEKS_DEFAULT_IMAGE;

      if (product.urun_adi.includes('BOOST')) {
        imageUrl = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514996/gul-tekin/varmeks/varmeks-varm-boost-series-1.png";
      } else if (product.urun_adi.includes('UP')) {
        imageUrl = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514994/gul-tekin/varmeks/varmeks-varm-up-series-1.png";
      } else {
        imageUrl = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514998/gul-tekin/varmeks/varmeks-general-1.png";
      }

      await sql`
        UPDATE urunler
        SET cloudinary_url = ${imageUrl}
        WHERE id = ${product.id}
      `;
      console.log(`✓ Updated: ${product.urun_adi} -> ${imageUrl.split('/').pop()}`);
      varmeksUpdated++;
    }

    console.log(`\nVarmeks: Updated ${varmeksUpdated} products\n`);

    // Get all LG products
    const lgProducts = await sql`
      SELECT id, urun_adi, slug, cloudinary_url
      FROM urunler
      WHERE marka = 'LG'
      ORDER BY urun_adi
    `;

    console.log(`Found ${lgProducts.length} LG products\n`);

    // Update LG products with new high-quality image
    let lgUpdated = 0;
    for (const product of lgProducts) {
      await sql`
        UPDATE urunler
        SET cloudinary_url = ${LG_DEFAULT_IMAGE}
        WHERE id = ${product.id}
      `;
      console.log(`✓ Updated: ${product.urun_adi}`);
      lgUpdated++;
    }

    console.log(`\nLG: Updated ${lgUpdated} products\n`);
    console.log("✅ Update complete!");

  } catch (error) {
    console.error("Error updating products:", error);
    throw error;
  }
}

updateProducts();
