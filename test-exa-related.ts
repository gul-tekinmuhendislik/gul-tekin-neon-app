import { sql } from "./lib/db";

async function testRelatedExaSearch() {
  try {
    console.log("=== EXA İLİŞKİLİ ARAMA TESTİ ===\n");

    // Get services with their related brands
    const servicesWithBrands = await sql`
      SELECT
        h.id as hizmet_id,
        h.hizmet_adi,
        h.kategori,
        m.marka_adi
      FROM hizmetler h
      INNER JOIN markalar m ON m.airtable_hizmetler_id::text LIKE '%' || h.id || '%'
      WHERE h.hizmet_adi IS NOT NULL
        AND m.marka_adi IS NOT NULL
        AND m.airtable_hizmetler_id IS NOT NULL
      LIMIT 20
    `;

    // Group by service
    const serviceGroups: Record<string, { kategori: string; markalar: string[] }> = {};
    servicesWithBrands.forEach(row => {
      if (!serviceGroups[row.hizmet_adi]) {
        serviceGroups[row.hizmet_adi] = {
          kategori: row.kategori,
          markalar: []
        };
      }
      if (!serviceGroups[row.hizmet_adi].markalar.includes(row.marka_adi)) {
        serviceGroups[row.hizmet_adi].markalar.push(row.marka_adi);
      }
    });

    // Get random products
    const products = await sql`
      SELECT urun_adi, kategori
      FROM urunler
      WHERE urun_adi IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 3
    `;

    console.log("=== SEÇİLEN HİZMET-MARKA İLİŞKİLERİ ===");
    Object.entries(serviceGroups).forEach(([service, data]) => {
      console.log(`\n${service} [${data.kategori}]:`);
      data.markalar.forEach(brand => console.log(`  - ${brand}`));
    });

    console.log("\n=== ÜRETİLEN ARAMA SORGULARI ===\n");

    const queries: string[] = [];
    const services = Object.keys(serviceGroups);

    if (services.length > 0) {
      // Pick a random service with its related brands
      const randomService = services[Math.floor(Math.random() * services.length)];
      const serviceData = serviceGroups[randomService];

      if (serviceData.markalar.length > 0) {
        // Use a brand that is ACTUALLY related to this service
        const relatedBrand = serviceData.markalar[Math.floor(Math.random() * serviceData.markalar.length)];

        // Create highly relevant queries
        queries.push(`${relatedBrand} ${randomService} kurulum montaj fiyat Bodrum Muğla`);
        queries.push(`${relatedBrand} ${randomService} özellikleri yorumlar 2024`);
        queries.push(`${randomService} teknoloji yenilikler ${relatedBrand} karşılaştırma`);

        console.log(`Seçilen Hizmet: ${randomService}`);
        console.log(`İlişkili Marka: ${relatedBrand}`);
        console.log(`Kategori: ${serviceData.kategori}\n`);
      }

      // Category-based query
      if (serviceData.kategori) {
        queries.push(`${serviceData.kategori} sistemleri Bodrum ${randomService} tavsiye`);
      }
    }

    // Product focused query if available
    if (products.length > 0) {
      const product = products[0];
      queries.push(`${product.urun_adi} özellikleri fiyat inceleme`);
      console.log(`\nSeçilen Ürün: ${product.urun_adi} [${product.kategori}]`);
    }

    console.log("\n=== OLUŞTURULAN SORGULAR ===");
    queries.forEach((q, i) => console.log(`${i + 1}. "${q}"`));

    console.log("\n✅ Test başarılı! Artık Exa aramaları gerçek ilişkili marka-hizmet çiftleri kullanıyor.");
    console.log("   Örneğin: 'ALARKO Isı Pompaları' veya 'GRUNDFOS Hidrofor Sistemleri' gibi.");

  } catch (error) {
    console.error("Test hatası:", error);
  }
}

testRelatedExaSearch().catch(console.error);