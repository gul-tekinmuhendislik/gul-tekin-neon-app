import { config } from "dotenv";
import { TwitterApi } from 'twitter-api-v2';
import { sql } from "./lib/db";

config();

async function testTwitterAPI() {
  console.log("\n🐦 Testing Twitter API Connection...\n");

  try {
    // Step 1: Check credentials
    console.log("1. Checking Twitter credentials...");
    const hasCredentials =
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!hasCredentials) {
      console.error("❌ Twitter credentials not found in environment variables!");
      console.log("\nRequired environment variables:");
      console.log("  - TWITTER_API_KEY");
      console.log("  - TWITTER_API_SECRET");
      console.log("  - TWITTER_ACCESS_TOKEN");
      console.log("  - TWITTER_ACCESS_TOKEN_SECRET");
      return;
    }

    console.log("✅ Twitter credentials found");

    // Step 2: Initialize Twitter client
    console.log("\n2. Initializing Twitter client...");
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });

    console.log("✅ Twitter client initialized");

    // Step 3: Verify credentials
    console.log("\n3. Verifying credentials...");
    try {
      const me = await client.v2.me();
      console.log("✅ Authentication successful!");
      console.log(`   - Username: @${me.data.username}`);
      console.log(`   - Name: ${me.data.name}`);
      console.log(`   - ID: ${me.data.id}`);
    } catch (error: any) {
      console.error("❌ Authentication failed:", error.message);
      if (error.code === 401) {
        console.log("   Invalid credentials. Please check your API keys and tokens.");
      }
      return;
    }

    // Step 4: Check for content ready to tweet
    console.log("\n4. Checking for content to tweet...");
    const readyContent = await sql`
      SELECT
        gc.id,
        gc.title,
        gc.slug,
        gc.image_url,
        gc.created_at
      FROM generated_content gc
      LEFT JOIN social_media_posts sm ON sm.content_id = gc.id AND sm.platform = 'twitter'
      WHERE gc.status = 'published'
        AND gc.image_url IS NOT NULL
        AND gc.image_url != ''
        AND sm.post_id IS NULL
      ORDER BY gc.created_at DESC
      LIMIT 5
    `;

    if (readyContent.length > 0) {
      console.log(`\n✅ Found ${readyContent.length} contents ready to tweet:`);
      for (const content of readyContent) {
        console.log(`   - ID ${content.id}: "${content.title.substring(0, 50)}..."`);
      }
    } else {
      console.log("   No untweeted content found.");
    }

    // Step 5: Test posting a simple tweet (without actually posting)
    console.log("\n5. Testing tweet composition...");
    if (readyContent.length > 0) {
      const testContent = readyContent[0];
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai.gul-tekinmuhendislik.com';
      const blogUrl = `${baseUrl}/blog/${testContent.slug}`;

      // Prepare tweet text
      let tweetText = testContent.title;
      if (tweetText.length > 200) {
        tweetText = tweetText.substring(0, 197) + '...';
      }

      const hashtags = ['#MekanikTesisat', '#EnerjiVerimliliği', '#Bodrum'];
      const fullTweet = `${tweetText}\n\n${hashtags.join(' ')}\n\n📖 Detaylı bilgi: ${blogUrl}`;

      console.log("\n   Sample tweet:");
      console.log("   " + "─".repeat(50));
      console.log(fullTweet.split('\n').map(line => `   ${line}`).join('\n'));
      console.log("   " + "─".repeat(50));
      console.log(`   Character count: ${fullTweet.length}/280`);

      if (testContent.image_url) {
        console.log(`   ✅ Would include image: ${testContent.image_url}`);
      }
    }

    console.log("\n✅ Twitter API test completed successfully!");
    console.log("\nTo post a tweet, run: npx tsx trigger-twitter-post.ts");

  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
  }
}

// Run the test
testTwitterAPI().catch(console.error);