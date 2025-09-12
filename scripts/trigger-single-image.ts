import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function triggerSingleImageGeneration(contentId: number) {
  try {
    console.log(`🎯 Triggering image generation for content ID: ${contentId}\n`);

    const inngestUrl = process.env.INNGEST_EVENT_KEY 
      ? "https://inn.gs/e/" + process.env.INNGEST_EVENT_KEY
      : "http://localhost:8288/e/local";

    // Trigger for specific content
    const response = await fetch(inngestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "images/generate.missing",
        data: {
          contentId: contentId,
          batchProcess: false
        },
        ts: Date.now()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to trigger event: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    console.log("✅ Image generation triggered successfully!");
    console.log("Event ID:", result.ids || result.id);
    console.log(`\n📸 Generating image for content ID ${contentId}`);
    console.log("\nProcess steps:");
    console.log("1. Fetch content and prompt from database");
    console.log("2. Generate image using Fal.ai (flux/schnell model)");
    console.log("3. Upload to Cloudinary with optimizations");
    console.log("4. Update database with image URL");
    
    console.log("\n💡 Monitor progress at:");
    console.log("http://localhost:8288");

  } catch (error) {
    console.error("❌ Error triggering image generation:", error);
    process.exit(1);
  }
}

// Get content ID from command line argument or use default
const contentId = process.argv[2] ? parseInt(process.argv[2]) : 20;

// Run the function
triggerSingleImageGeneration(contentId)
  .then(() => {
    console.log("\n✨ Trigger completed successfully!");
    console.log(`Image generation started for content ID: ${contentId}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Trigger failed:", error);
    process.exit(1);
  });