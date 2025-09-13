import { inngest } from "./lib/inngest/client";

async function triggerExaSearchNow() {
  console.log("🚀 Exa aramayı manuel olarak tetikliyorum...\n");

  try {
    // searchAndSaveResults fonksiyonunu manuel tetikle
    const result = await inngest.send({
      name: "test/manual.exa.search",
      data: {
        triggeredBy: "manual",
        timestamp: new Date().toISOString()
      }
    });

    console.log("✅ Arama tetiklendi!");
    console.log("Event ID:", result.ids[0]);
    console.log("\n📊 Sonuçları görmek için:");
    console.log("1. Inngest Dashboard'u kontrol edin");
    console.log("2. Veya birkaç saniye bekleyip şu SQL'i çalıştırın:");
    console.log(`
SELECT
  search_query,
  result_title,
  result_url,
  created_at
FROM search_results
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;
    `);

  } catch (error) {
    console.error("❌ Hata:", error);
  }
}

triggerExaSearchNow().catch(console.error);