import { sql } from "../lib/db";

async function updateExistingDomains() {
  console.log("🔄 Mevcut kayıtlardaki boş domain field'larını güncelliyorum...\n");

  try {
    // First, check how many records have empty domains
    const emptyDomains = await sql`
      SELECT COUNT(*) as count
      FROM search_results
      WHERE domain IS NULL OR domain = ''
    `;

    console.log(`📊 Boş domain'e sahip kayıt sayısı: ${emptyDomains[0].count}`);

    if (emptyDomains[0].count === 0) {
      console.log("✅ Tüm kayıtların domain bilgisi mevcut!");
      process.exit(0);
    }

    // Get all records with empty domains
    const records = await sql`
      SELECT id, result_url
      FROM search_results
      WHERE (domain IS NULL OR domain = '')
        AND result_url IS NOT NULL
        AND result_url != ''
    `;

    console.log(`🔍 Güncellenecek kayıt sayısı: ${records.length}\n`);

    let successCount = 0;
    let failCount = 0;
    const domains: { [key: string]: number } = {};

    // Update each record
    for (const record of records) {
      try {
        let domain = null;

        // Extract domain from URL
        if (record.result_url) {
          try {
            // Use JavaScript URL parsing for domain extraction
            const urlObj = new URL(record.result_url);
            domain = urlObj.hostname;

            // Remove 'www.' prefix if exists
            if (domain.startsWith('www.')) {
              domain = domain.substring(4);
            }
          } catch (e) {
            // Fallback regex if URL parsing fails
            const domainMatch = record.result_url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
            domain = domainMatch ? domainMatch[1] : null;
          }
        }

        if (domain) {
          // Update the record with extracted domain
          await sql`
            UPDATE search_results
            SET domain = ${domain}
            WHERE id = ${record.id}
          `;

          successCount++;

          // Track domain statistics
          domains[domain] = (domains[domain] || 0) + 1;

          // Show progress every 10 records
          if (successCount % 10 === 0) {
            console.log(`✓ ${successCount} kayıt güncellendi...`);
          }
        } else {
          console.log(`⚠️  Domain çıkarılamadı - ID: ${record.id}, URL: ${record.result_url}`);
          failCount++;
        }
      } catch (error) {
        console.error(`❌ Hata - ID: ${record.id}:`, error);
        failCount++;
      }
    }

    console.log("\n📈 Güncelleme Özeti:");
    console.log(`✅ Başarılı: ${successCount} kayıt`);
    console.log(`❌ Başarısız: ${failCount} kayıt`);

    // Show top domains
    const sortedDomains = Object.entries(domains)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (sortedDomains.length > 0) {
      console.log("\n🌐 En çok bulunan domain'ler:");
      sortedDomains.forEach(([domain, count]) => {
        console.log(`  - ${domain}: ${count} kayıt`);
      });
    }

    // Verify the update
    const stillEmpty = await sql`
      SELECT COUNT(*) as count
      FROM search_results
      WHERE domain IS NULL OR domain = ''
    `;

    console.log(`\n📊 Güncelleme sonrası boş domain sayısı: ${stillEmpty[0].count}`);

    // Also update the updated_at timestamp for modified records
    if (successCount > 0) {
      await sql`
        UPDATE search_results
        SET updated_at = CURRENT_TIMESTAMP
        WHERE domain IS NOT NULL
          AND updated_at < CURRENT_TIMESTAMP - INTERVAL '1 minute'
      `;
      console.log("⏰ updated_at timestamp'leri güncellendi");
    }

  } catch (error) {
    console.error("❌ Güncelleme hatası:", error);
    process.exit(1);
  }

  console.log("\n✨ Domain güncelleme işlemi tamamlandı!");
  process.exit(0);
}

// Run the update
updateExistingDomains().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});