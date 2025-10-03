import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local") });
const sql = neon(process.env.DATABASE_URL!);

async function listImages() {
  const products = await sql`
    SELECT urun_adi, slug, marka, cloudinary_url
    FROM urunler
    WHERE marka IN ('Varmeks', 'LG') AND (stokta = true OR stokta IS NULL)
    ORDER BY marka, urun_adi
  `;

  console.log("=== VARMEKS PRODUCTS ===\n");
  products.filter((p: any) => p.marka === 'Varmeks').forEach((p: any) => {
    console.log(`${p.urun_adi}`);
    console.log(`  Slug: ${p.slug}`);
    console.log(`  Image: ${p.cloudinary_url}`);
    console.log();
  });

  console.log("\n=== LG PRODUCTS ===\n");
  products.filter((p: any) => p.marka === 'LG').forEach((p: any) => {
    console.log(`${p.urun_adi}`);
    console.log(`  Slug: ${p.slug}`);
    console.log(`  Image: ${p.cloudinary_url}`);
    console.log();
  });
}

listImages();
