const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.$queryRawUnsafe(`
    SELECT id, urun_adi, slug, kategori, anasayfa_goster, aktif, stokta, cloudinary_url
    FROM urunler
    WHERE marka ILIKE '%Varmeks%'
      AND urun_adi NOT ILIKE '%pool%'
      AND urun_adi NOT ILIKE '%havuz%'
      AND (kategori IS NULL OR (kategori NOT ILIKE '%havuz%' AND kategori NOT ILIKE '%pool%'))
    ORDER BY 
      CASE 
        WHEN urun_adi ILIKE '%BOOST%' THEN 1
        WHEN urun_adi ILIKE '%UP%' THEN 2
        WHEN urun_adi ILIKE '%ALL%' THEN 3
        ELSE 4
      END,
      urun_adi ASC
  `);
  console.log(`Ev Tipi Varmeks Ürünleri (${prods.length}):`);
  prods.forEach(p => {
    console.log(`- ${p.urun_adi} | Aktif: ${p.aktif} | Stok: ${p.stokta} | Resim: ${!!p.cloudinary_url} | Slug: ${p.slug}`);
  });
  await prisma.$disconnect();
}

main();
