import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

// Load .env.local first
config({ path: resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function checkProductImages() {
  console.log("Checking for brand logo images instead of product images...\n");

  // Get all products with images
  const products = await sql`
    SELECT id, urun_adi, marka, slug, cloudinary_url
    FROM urunler
    WHERE marka IN ('Varmeks', 'LG')
    ORDER BY marka, urun_adi
  `;

  console.log(`Total products: ${products.length}\n`);

  // Specific product image mappings
  const productImageMap: Record<string, string> = {
    // Varmeks UP Series - use UP series image
    "varmeks-varm-up-8-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514994/gul-tekin/varmeks/varmeks-varm-up-series-1.png",
    "varmeks-varm-up-13-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514994/gul-tekin/varmeks/varmeks-varm-up-series-1.png",
    "varmeks-varm-up-16-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514994/gul-tekin/varmeks/varmeks-varm-up-series-1.png",
    "varmeks-varm-up-18-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514994/gul-tekin/varmeks/varmeks-varm-up-series-1.png",

    // Varmeks BOOST Series - use BOOST series image
    "varmeks-varm-boost-8-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514996/gul-tekin/varmeks/varmeks-varm-boost-series-1.png",
    "varmeks-varm-boost-11-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514996/gul-tekin/varmeks/varmeks-varm-boost-series-1.png",
    "varmeks-varm-boost-15-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514996/gul-tekin/varmeks/varmeks-varm-boost-series-1.png",
    "varmeks-varm-boost-22-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514996/gul-tekin/varmeks/varmeks-varm-boost-series-1.png",

    // LG products - use LG Therma V image
    "lg-therma-v-r32-monobloc-s-9-kw": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-therma-v-r32-monobloc-s-12-kw": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-therma-v-r32-monobloc-s-14-kw": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-therma-v-r32-monobloc-s-16-kw": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-9-kw-inverter-monoblok-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-12-kw-inverter-monoblok-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-16-kw-inverter-monoblok-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
  };

  console.log("Product images to be updated:\n");

  for (const product of products) {
    const newImageUrl = productImageMap[product.slug];
    if (newImageUrl) {
      console.log(`${product.urun_adi}`);
      console.log(`  Slug: ${product.slug}`);
      console.log(`  Old: ${product.cloudinary_url}`);
      console.log(`  New: ${newImageUrl.split('/').slice(-1)[0]}`);
      console.log();
    }
  }

  console.log("\nDo you want to update these images? Run with --update flag to proceed.");
}

async function updateProductImages() {
  console.log("Updating product images...\n");

  const productImageMap: Record<string, string> = {
    // Varmeks UP Series
    "varmeks-varm-up-8-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514994/gul-tekin/varmeks/varmeks-varm-up-series-1.png",
    "varmeks-varm-up-13-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514994/gul-tekin/varmeks/varmeks-varm-up-series-1.png",
    "varmeks-varm-up-16-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514994/gul-tekin/varmeks/varmeks-varm-up-series-1.png",
    "varmeks-varm-up-18-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514994/gul-tekin/varmeks/varmeks-varm-up-series-1.png",

    // Varmeks BOOST Series
    "varmeks-varm-boost-8-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514996/gul-tekin/varmeks/varmeks-varm-boost-series-1.png",
    "varmeks-varm-boost-11-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514996/gul-tekin/varmeks/varmeks-varm-boost-series-1.png",
    "varmeks-varm-boost-15-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514996/gul-tekin/varmeks/varmeks-varm-boost-series-1.png",
    "varmeks-varm-boost-22-kw-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759514996/gul-tekin/varmeks/varmeks-varm-boost-series-1.png",

    // LG products
    "lg-therma-v-r32-monobloc-s-9-kw": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-therma-v-r32-monobloc-s-12-kw": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-therma-v-r32-monobloc-s-14-kw": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-therma-v-r32-monobloc-s-16-kw": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-9-kw-inverter-monoblok-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-12-kw-inverter-monoblok-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
    "lg-16-kw-inverter-monoblok-isi-pompasi": "https://res.cloudinary.com/dgfdk0l8j/image/upload/v1759515003/gul-tekin/lg/lg-therma-v-monobloc-1.jpg",
  };

  let updated = 0;

  for (const [slug, imageUrl] of Object.entries(productImageMap)) {
    await sql`
      UPDATE urunler
      SET cloudinary_url = ${imageUrl}
      WHERE slug = ${slug}
    `;
    console.log(`✓ Updated: ${slug}`);
    updated++;
  }

  console.log(`\n✅ Updated ${updated} products with correct product images`);
}

const shouldUpdate = process.argv.includes('--update');
if (shouldUpdate) {
  updateProductImages();
} else {
  checkProductImages();
}
