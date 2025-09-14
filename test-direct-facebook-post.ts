import { config } from "dotenv";
import { sql } from "./lib/db";
import {
  getFacebookPageAccessToken,
  extractOGData,
  postToFacebookPage
} from "./lib/facebook-api";

config();

async function testDirectFacebookPost() {
  console.log("\n🚀 Testing Direct Facebook Post...\n");

  try {
    // Step 1: Get credentials
    console.log("1. Getting Facebook credentials...");
    const credentials = await getFacebookPageAccessToken();

    if (!credentials) {
      console.error("❌ No Facebook credentials found!");
      return;
    }

    console.log("✅ Credentials found");

    // Step 2: Get latest content with image
    console.log("\n2. Getting content to post...");
    const result = await sql`
      SELECT
        id,
        title,
        meta_title,
        meta_description,
        slug,
        keywords,
        image_url
      FROM generated_content
      WHERE status = 'published'
        AND image_url IS NOT NULL
        AND image_url != ''
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      console.log("❌ No content found!");
      return;
    }

    const content = result[0];
    console.log(`✅ Found content: ${content.title}`);
    console.log(`   Image: ${content.image_url}`);

    // Step 3: Prepare post data
    console.log("\n3. Preparing post data...");
    const postData = extractOGData({
      title: content.meta_title || content.title,
      meta_description: content.meta_description,
      slug: content.slug,
      keywords: content.keywords,
      image_url: content.image_url
    });

    console.log("✅ Post data prepared:");
    console.log(`   Title: ${postData.title}`);
    console.log(`   Link: ${postData.link}`);
    console.log(`   Image will be scraped from og:image tag`);

    // Step 4: Post to Facebook
    console.log("\n4. Posting to Facebook...");
    const response = await postToFacebookPage(
      postData,
      credentials.accessToken,
      credentials.pageId
    );

    if (response) {
      console.log("\n✅ Successfully posted to Facebook!");
      console.log(`   Post ID: ${response.id}`);
      console.log(`   View at: https://www.facebook.com/${response.id}`);

      // Save to database
      const { saveFacebookPost } = await import("./lib/facebook-api");
      await saveFacebookPost(
        content.id,
        response.id,
        postData,
        "published"
      );

      console.log("✅ Saved to database");
    } else {
      console.error("\n❌ Failed to post to Facebook");
    }

  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

// Run the test
testDirectFacebookPost().catch(console.error);