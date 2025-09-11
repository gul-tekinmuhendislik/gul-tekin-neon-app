import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function triggerImageGeneration() {
  try {
    console.log("🚀 Starting image generation for contents without images...\n");

    const inngestUrl = process.env.INNGEST_EVENT_KEY 
      ? "https://inn.gs/e/" + process.env.INNGEST_EVENT_KEY
      : "http://localhost:8288/e/local";

    // Trigger batch processing for multiple contents
    const response = await fetch(inngestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "images/generate.missing",
        data: {
          batchProcess: true,
          limit: 5 // Process 5 contents at once
        },
        ts: Date.now()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to trigger event: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    console.log("✅ Batch processing triggered successfully!");
    console.log("Event ID:", result.ids || result.id);
    console.log("\n📊 The function will:");
    console.log("1. Find contents with prompts but no images");
    console.log("2. Generate images using Fal.ai");
    console.log("3. Upload to Cloudinary");
    console.log("4. Update database with image URLs");
    
    console.log("\n💡 Check Inngest dashboard for function status:");
    console.log("https://app.inngest.com/");

  } catch (error) {
    console.error("❌ Error triggering image generation:", error);
    process.exit(1);
  }
}

// Run the function
triggerImageGeneration()
  .then(() => {
    console.log("\n✨ Trigger completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Trigger failed:", error);
    process.exit(1);
  });