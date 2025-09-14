import { config } from "dotenv";
import { inngest } from "./lib/inngest/client";
import { sql } from "./lib/db";

config();

async function triggerTwitterPost() {
  console.log("\n🐦 Triggering Twitter Post...\n");

  try {
    // Get the latest unpublished content with image
    const result = await sql`
      SELECT
        gc.id,
        gc.title,
        gc.slug,
        gc.image_url
      FROM generated_content gc
      LEFT JOIN social_media_posts sm ON sm.content_id = gc.id AND sm.platform = 'twitter'
      WHERE gc.status = 'published'
        AND gc.image_url IS NOT NULL
        AND gc.image_url != ''
        AND sm.post_id IS NULL
      ORDER BY gc.created_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      console.log("❌ No untweeted content found!");
      return;
    }

    const content = result[0];
    console.log(`📝 Found content to tweet:`);
    console.log(`   - ID: ${content.id}`);
    console.log(`   - Title: ${content.title}`);
    console.log(`   - Slug: ${content.slug}`);
    console.log(`   - Image: ${content.image_url}`);

    // Send event to Inngest
    console.log("\n📨 Sending event to Inngest...");
    const event = await inngest.send({
      name: "blog/twitter.share.requested",
      data: {
        blogId: content.id
      }
    });

    console.log("✅ Event sent successfully!");
    console.log(`   Event ID: ${event.ids[0]}`);

    console.log("\n📊 To check the status:");
    console.log("   1. Visit: https://app.inngest.com/");
    console.log("   2. Check the 'share-blog-on-twitter' function");
    console.log(`   3. Look for event ID: ${event.ids[0]}`);

    // Wait and check status
    console.log("\n⏳ Waiting 10 seconds to check status...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    const postStatus = await sql`
      SELECT * FROM social_media_posts
      WHERE content_id = ${content.id}
        AND platform = 'twitter'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (postStatus.length > 0) {
      const status = postStatus[0];
      console.log("\n📊 Tweet Status:");
      console.log(`   Status: ${status.status}`);
      console.log(`   Tweet ID: ${status.post_id}`);
      if (status.status === 'published') {
        console.log(`\n✅ Successfully posted to Twitter!`);
        console.log(`   View on Twitter: https://twitter.com/gul_tekin_muh/status/${status.post_id}`);
      } else if (status.status === 'failed') {
        console.log(`\n❌ Failed to post to Twitter`);
        console.log(`   Check Inngest dashboard for error details`);
      }
    } else {
      console.log("\n⚠️ No tweet status found yet. Check Inngest dashboard for details.");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the trigger
triggerTwitterPost().catch(console.error);