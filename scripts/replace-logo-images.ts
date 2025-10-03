import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local") });
const sql = neon(process.env.DATABASE_URL!);

// Replace the logo image with a better default
const OLD_IMAGE = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514998/gul-tekin/varmeks/varmeks-general-1.png";
const NEW_IMAGE = "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514999/gul-tekin/varmeks/varmeks-general-2.jpg";

async function replaceImages() {
  console.log("Replacing potential logo images with better defaults...\n");
  console.log(`Old image: ${OLD_IMAGE.split('/').pop()}`);
  console.log(`New image: ${NEW_IMAGE.split('/').pop()}\n`);

  // Get all products using the old image
  const products = await sql`
    SELECT id, urun_adi, marka, cloudinary_url
    FROM urunler
    WHERE cloudinary_url = ${OLD_IMAGE}
  `;

  console.log(`Found ${products.length} products using this image\n`);

  if (products.length > 0) {
    // Update all products
    await sql`
      UPDATE urunler
      SET cloudinary_url = ${NEW_IMAGE}
      WHERE cloudinary_url = ${OLD_IMAGE}
    `;

    console.log("Updated products:");
    products.forEach((p: any) => {
      console.log(`  ✓ ${p.urun_adi}`);
    });

    console.log(`\n✅ Updated ${products.length} products`);
  } else {
    console.log("No products found using this image");
  }
}

replaceImages();
