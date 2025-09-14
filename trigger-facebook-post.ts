import { config } from "dotenv";
import { inngest } from "./lib/inngest/client";
import { sql } from "./lib/db";

config();

async function triggerFacebookPost() {
  console.log("\n🚀 Triggering Facebook Post...\n");

  try {
    // Get the latest unpublished content with image
    const result = await sql`
      SELECT
        gc.id,
        gc.title,
        gc.slug,
        gc.image_url
      FROM generated_content gc
      LEFT JOIN social_media_posts sm ON sm.content_id = gc.id AND sm.platform = 'facebook'
      WHERE gc.status = 'published'
        AND gc.image_url IS NOT NULL
        AND gc.image_url != ''
        AND (sm.post_id IS NULL OR sm.status = 'failed')
      ORDER BY gc.created_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      console.log("❌ No unpublished content found!");
      return;
    }

    const content = result[0];
    console.log(`📝 Found content to post:`);
    console.log(`   - ID: ${content.id}`);
    console.log(`   - Title: ${content.title}`);
    console.log(`   - Slug: ${content.slug}`);
    console.log(`   - Image: ${content.image_url}`);

    // Send event to Inngest
    console.log("\n📨 Sending event to Inngest...");
    const event = await inngest.send({
      name: "social/facebook.post",
      data: {
        contentId: content.id,
        immediate: true
      }
    });

    console.log("✅ Event sent successfully!");
    console.log(`   Event ID: ${event.ids[0]}`);

    console.log("\n📊 To check the status:");
    console.log("   1. Visit: https://app.inngest.com/");
    console.log("   2. Check the 'post-to-facebook' function");
    console.log(`   3. Look for event ID: ${event.ids[0]}`);

    // Also check the status after a few seconds
    console.log("\n⏳ Waiting 10 seconds to check status...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    const postStatus = await sql`
      SELECT * FROM social_media_posts
      WHERE content_id = ${content.id}
        AND platform = 'facebook'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (postStatus.length > 0) {
      const status = postStatus[0];
      console.log("\n📊 Post Status:");
      console.log(`   Status: ${status.status}`);
      console.log(`   Post ID: ${status.post_id}`);
      if (status.status === 'published') {
        console.log(`\n✅ Successfully posted to Facebook!`);
        console.log(`   View on Facebook: https://www.facebook.com/${status.post_id}`);
      } else if (status.status === 'failed') {
        console.log(`\n❌ Failed to post to Facebook`);
        console.log(`   Check Inngest dashboard for error details`);
      }
    } else {
      console.log("\n⚠️ No post status found yet. Check Inngest dashboard for details.");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the trigger
triggerFacebookPost().catch(console.error);