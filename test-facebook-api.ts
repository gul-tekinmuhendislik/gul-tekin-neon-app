import { config } from "dotenv";
import { sql } from "./lib/db";
import { getFacebookPageAccessToken, validateAccessToken } from "./lib/facebook-api";

config();

async function testFacebookAPI() {
  console.log("\n🔍 Testing Facebook API Connection...\n");

  try {
    // Step 1: Get credentials
    console.log("1. Getting Facebook credentials...");
    const credentials = await getFacebookPageAccessToken();

    if (!credentials) {
      console.error("❌ No Facebook credentials found!");
      return;
    }

    console.log("✅ Facebook credentials found:");
    console.log(`   - Page ID: ${credentials.pageId}`);
    console.log(`   - Token: ${credentials.accessToken.substring(0, 20)}...`);

    // Step 2: Validate token
    console.log("\n2. Validating access token...");
    const isValid = await validateAccessToken(credentials.accessToken);

    if (!isValid) {
      console.error("❌ Access token is invalid!");
      console.log("   Please check your Facebook access token.");
      return;
    }

    console.log("✅ Access token is valid!");

    // Step 3: Test API call - Get page info
    console.log("\n3. Testing API call - Getting page info...");
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${credentials.pageId}?fields=name,id,fan_count,followers_count&access_token=${credentials.accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ API call failed:", error);
      return;
    }

    const pageInfo = await response.json();
    console.log("✅ API call successful!");
    console.log(`   - Page Name: ${pageInfo.name}`);
    console.log(`   - Followers: ${pageInfo.followers_count || pageInfo.fan_count || 'N/A'}`);

    // Step 4: Check recent posts to understand the issue
    console.log("\n4. Checking recent failed posts in database...");
    const failedPosts = await sql`
      SELECT
        sm.content_id,
        sm.status,
        sm.created_at,
        sm.updated_at,
        gc.title,
        gc.image_url
      FROM social_media_posts sm
      JOIN generated_content gc ON gc.id = sm.content_id
      WHERE sm.platform = 'facebook'
        AND sm.status = 'failed'
      ORDER BY sm.created_at DESC
      LIMIT 5
    `;

    if (failedPosts.length > 0) {
      console.log(`\n⚠️ Found ${failedPosts.length} failed Facebook posts:`);
      for (const post of failedPosts) {
        console.log(`   - Content ID ${post.content_id}: "${post.title}"`);
        console.log(`     Status: ${post.status}`);
        console.log(`     Image: ${post.image_url ? 'Yes' : 'No'}`);
        console.log(`     Created: ${new Date(post.created_at).toLocaleString()}`);
      }
    }

    // Step 5: Check for unpublished content with images
    console.log("\n5. Checking for content ready to post...");
    const readyContent = await sql`
      SELECT
        gc.id,
        gc.title,
        gc.slug,
        gc.status,
        gc.image_url,
        gc.created_at,
        sm.post_id
      FROM generated_content gc
      LEFT JOIN social_media_posts sm ON sm.content_id = gc.id AND sm.platform = 'facebook'
      WHERE gc.status = 'published'
        AND gc.image_url IS NOT NULL
        AND gc.image_url != ''
        AND (sm.post_id IS NULL OR sm.status = 'failed')
      ORDER BY gc.created_at DESC
      LIMIT 5
    `;

    if (readyContent.length > 0) {
      console.log(`\n✅ Found ${readyContent.length} contents ready to post:`);
      for (const content of readyContent) {
        console.log(`   - ID ${content.id}: "${content.title}"`);
        console.log(`     Image: ${content.image_url}`);
        console.log(`     Created: ${new Date(content.created_at).toLocaleString()}`);
      }
    } else {
      console.log("   No unpublished content with images found.");
    }

    // Step 6: Test posting with a sample (if there's content ready)
    if (readyContent.length > 0) {
      console.log("\n6. Testing Facebook post with latest content...");
      const testContent = readyContent[0];

      const testPost = {
        message: `Test post: ${testContent.title}\n\nThis is a test post to verify API connectivity.\n\n#Test #GülTekinMühendislik`,
        link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gul-tekinmuhendislik.com'}/blog/${testContent.slug}`,
        picture: testContent.image_url
      };

      console.log("\n   Post data:");
      console.log(`   - Message: ${testPost.message.substring(0, 100)}...`);
      console.log(`   - Link: ${testPost.link}`);
      console.log(`   - Image: ${testPost.picture}`);

      // Make a test API call (without actually posting)
      const testResponse = await fetch(
        `https://graph.facebook.com/v23.0/${credentials.pageId}/feed?access_token=${credentials.accessToken}&fields=message,link,picture&limit=1`
      );

      if (testResponse.ok) {
        console.log("\n✅ Facebook API is accessible and working!");
      } else {
        const error = await testResponse.json();
        console.error("\n❌ API test failed:", error);
      }
    }

    console.log("\n✅ Facebook API test completed successfully!");

  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
  }
}

// Run the test
testFacebookAPI().catch(console.error);