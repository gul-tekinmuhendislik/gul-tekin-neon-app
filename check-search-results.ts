import { sql } from "./lib/db";

async function checkSearchResults() {
  console.log("📊 SON ARAMA SONUÇLARI\n");

  // Son 24 saatteki aramalar
  const recentSearches = await sql`
    SELECT
      search_query,
      COUNT(*) as result_count,
      MAX(created_at) as last_search
    FROM search_results
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY search_query
    ORDER BY last_search DESC
    LIMIT 10
  `;

  console.log("=== SON 24 SAATTEKİ ARAMALAR ===");
  recentSearches.forEach(s => {
    console.log(`📍 "${s.search_query}"`);
    console.log(`   Sonuç sayısı: ${s.result_count}`);
    console.log(`   Son arama: ${new Date(s.last_search).toLocaleString('tr-TR')}\n`);
  });

  // Toplam istatistikler
  const stats = await sql`
    SELECT
      COUNT(*) as total_results,
      COUNT(DISTINCT search_query) as unique_queries,
      MIN(created_at) as oldest_result,
      MAX(created_at) as newest_result
    FROM search_results
  `;

  console.log("=== GENEL İSTATİSTİKLER ===");
  console.log(`📈 Toplam sonuç: ${stats[0].total_results}`);
  console.log(`🔍 Benzersiz sorgu: ${stats[0].unique_queries}`);
  console.log(`📅 En eski: ${new Date(stats[0].oldest_result).toLocaleString('tr-TR')}`);
  console.log(`🆕 En yeni: ${new Date(stats[0].newest_result).toLocaleString('tr-TR')}`);

  // Son bulunan içerikler
  const latestContent = await sql`
    SELECT
      result_title,
      result_url,
      search_query,
      created_at
    FROM search_results
    ORDER BY created_at DESC
    LIMIT 5
  `;

  console.log("\n=== SON BULUNAN İÇERİKLER ===");
  latestContent.forEach((c, i) => {
    console.log(`\n${i + 1}. ${c.result_title}`);
    console.log(`   🔗 ${c.result_url}`);
    console.log(`   🔍 Sorgu: "${c.search_query}"`);
    console.log(`   📅 ${new Date(c.created_at).toLocaleString('tr-TR')}`);
  });
}

checkSearchResults().catch(console.error);