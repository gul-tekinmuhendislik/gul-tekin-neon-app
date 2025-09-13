import { inngest } from "./lib/inngest/client";

async function testDynamicExaSearch() {
  console.log("Testing dynamic Exa search with brands and services...");

  try {
    // Trigger the search function manually
    const result = await inngest.send({
      name: "test/trigger.exa.search",
      data: {
        manual: true,
        timestamp: new Date().toISOString()
      }
    });

    console.log("Event sent successfully:", result);
    console.log("\nCheck the Inngest dashboard to see the function execution.");
    console.log("The function will:");
    console.log("1. Fetch random brands, services, and products from database");
    console.log("2. Generate dynamic search queries");
    console.log("3. Search with Exa API");
    console.log("4. Save results to search_results table");

  } catch (error) {
    console.error("Error triggering search:", error);
  }
}

// Run the test
testDynamicExaSearch().catch(console.error);