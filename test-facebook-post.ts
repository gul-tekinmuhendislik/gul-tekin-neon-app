import { config } from 'dotenv';
import { sql } from './lib/db';
import { inngest } from './lib/inngest/client';

// Load environment variables
config();

async function testFacebookPost() {
  try {
    console.log('🔍 Facebook Post Test Script\n');

    // 1. Check environment variables
    console.log('1️⃣ Checking environment variables...');
    const hasToken = !!process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const hasPageId = !!process.env.FACEBOOK_PAGE_ID;
    console.log(`   FACEBOOK_PAGE_ACCESS_TOKEN: ${hasToken ? '✅ Set' : '❌ Missing'}`);
    console.log(`   FACEBOOK_PAGE_ID: ${hasPageId ? '✅ Set' : '❌ Missing'}`);

    if (!hasToken || !hasPageId) {
      console.error('\n❌ Missing Facebook credentials in environment variables');
      process.exit(1);
    }

    // 2. Check database for active token
    console.log('\n2️⃣ Checking database for active Facebook token...');
    const tokenResult = await sql`
      SELECT
        id,
        access_token,
        page_id,
        page_name,
        expires_at,
        is_active,
        created_at
      FROM social_tokens
      WHERE platform = 'facebook'
        AND token_type = 'page_access_token'
        AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (tokenResult.length > 0) {
      const token = tokenResult[0];
      const expiresAt = new Date(token.expires_at);
      const now = new Date();
      const daysRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`   ✅ Token found in database`);
      console.log(`   Page: ${token.page_name} (${token.page_id})`);
      console.log(`   Expires: ${expiresAt.toISOString()} (${daysRemaining} days remaining)`);
      console.log(`   Active: ${token.is_active ? 'Yes' : 'No'}`);

      if (daysRemaining < 0) {
        console.error('\n❌ Token has expired!');
      }
    } else {
      console.log('   ⚠️ No token in database, will use environment variables');
    }

    // 3. Check for published content without Facebook posts
    console.log('\n3️⃣ Checking for published content without Facebook posts...');
    const contentResult = await sql`
      SELECT
        gc.id,
        gc.title,
        gc.slug,
        gc.status,
        gc.image_url,
        gc.created_at,
        smp.post_id as facebook_post_id,
        smp.status as facebook_status
      FROM generated_content gc
      LEFT JOIN social_media_posts smp
        ON gc.id = smp.content_id
        AND smp.platform = 'facebook'
      WHERE gc.status = 'published'
        AND gc.image_url IS NOT NULL
        AND gc.image_url != ''
        AND (smp.post_id IS NULL OR smp.status = 'failed')
      ORDER BY gc.created_at DESC
      LIMIT 5
    `;

    if (contentResult.length === 0) {
      console.log('   ℹ️ No published content found without Facebook posts');
    } else {
      console.log(`   Found ${contentResult.length} content items without Facebook posts:`);
      contentResult.forEach((content, index) => {
        console.log(`   ${index + 1}. "${content.title}" (ID: ${content.id})`);
        console.log(`      Created: ${new Date(content.created_at).toISOString()}`);
        console.log(`      Image: ${content.image_url ? '✅' : '❌'}`);
        console.log(`      Facebook: ${content.facebook_post_id ? `Posted (${content.facebook_status})` : 'Not posted'}`);
      });

      // 4. Test posting the first content
      const contentToPost = contentResult[0];
      console.log(`\n4️⃣ Testing Facebook post for content ID: ${contentToPost.id}`);
      console.log(`   Title: "${contentToPost.title}"`);

      const confirmPost = true; // In production, you might want to prompt for confirmation

      if (confirmPost) {
        console.log('\n5️⃣ Triggering Facebook post via Inngest...');

        try {
          const result = await inngest.send({
            name: "social/facebook.post",
            data: {
              contentId: contentToPost.id,
              immediate: true
            }
          });

          console.log('   ✅ Facebook post event sent successfully');
          console.log('   Event ID:', result.ids?.[0] || 'N/A');
          console.log('\n   ℹ️ Check Inngest dashboard for function execution status');
          console.log('   URL: https://app.inngest.com/');
        } catch (error) {
          console.error('   ❌ Failed to send Facebook post event:', error);
        }
      }
    }

    // 5. Check recent Facebook post attempts
    console.log('\n6️⃣ Checking recent Facebook post attempts in event logs...');
    const eventLogs = await sql`
      SELECT
        id,
        event_name,
        status,
        error_message,
        payload,
        created_at
      FROM event_logs
      WHERE event_name IN ('social.facebook.posted', 'social.facebook.failed', 'facebook.token.missing', 'facebook.token.expiring')
      ORDER BY created_at DESC
      LIMIT 5
    `;

    if (eventLogs.length > 0) {
      console.log(`   Found ${eventLogs.length} recent Facebook-related events:`);
      eventLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.event_name} - ${log.status}`);
        console.log(`      Time: ${new Date(log.created_at).toISOString()}`);
        if (log.error_message) {
          console.log(`      Error: ${log.error_message}`);
        }
      });
    } else {
      console.log('   No recent Facebook events found');
    }

    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the test
testFacebookPost();