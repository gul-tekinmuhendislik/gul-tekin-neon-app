import { sql } from "./lib/db";

async function testHizmetMarkaRelation() {
  try {
    // Hizmet-marka ilişkisini kontrol et
    const result = await sql`
      SELECT
        m.marka_adi,
        m.airtable_hizmetler_id,
        h.id as hizmet_id,
        h.hizmet_adi,
        h.kategori
      FROM markalar m
      INNER JOIN hizmetler h ON m.airtable_hizmetler_id::text LIKE '%' || h.id || '%'
      WHERE m.airtable_hizmetler_id IS NOT NULL
        AND h.hizmet_adi IS NOT NULL
      ORDER BY h.hizmet_adi, m.marka_adi
      LIMIT 50
    `;

    console.log("=== İLİŞKİLİ MARKA-HİZMET EŞLEŞMELERİ ===");
    console.log("Toplam eşleşme:", result.length);

    // Gruplara ayır
    const groupedByService: Record<string, { kategori: string; markalar: string[] }> = {};

    result.forEach((r) => {
      if (!groupedByService[r.hizmet_adi]) {
        groupedByService[r.hizmet_adi] = {
          kategori: r.kategori,
          markalar: []
        };
      }
      if (!groupedByService[r.hizmet_adi].markalar.includes(r.marka_adi)) {
        groupedByService[r.hizmet_adi].markalar.push(r.marka_adi);
      }
    });

    console.log("\n=== HİZMET BAZINDA İLGİLİ MARKALAR ===");
    Object.entries(groupedByService).forEach(([service, data]) => {
      console.log(`\n${service} [${data.kategori}]:`);
      data.markalar.forEach(b => console.log(`  - ${b}`));
    });

    // Örnek sorgular oluştur
    console.log("\n=== ÖRNEK ARAMALAR (İLİŞKİLİ MARKA-HİZMET) ===");

    Object.entries(groupedByService).slice(0, 3).forEach(([service, data]) => {
      if (data.markalar.length > 0) {
        const marka = data.markalar[0];
        console.log(`- "${marka} ${service} kurulum montaj fiyat Bodrum"`);
        console.log(`- "${marka} ${service} özellikleri karşılaştırma 2024"`);
      }
    });

  } catch (error) {
    console.error("Error:", error);
  }
}

testHizmetMarkaRelation().catch(console.error);