import { inngest } from "./client";
import { sql } from "../db";
import {
  isTwitterConfigured,
  createTweetText,
  uploadMediaToTwitter,
  postTweet,
  saveTweetToDatabase,
  checkIfAlreadyTweeted,
  getTwitterAccountInfo,
  type BlogContent
} from "../twitter-api";

// Share blog post on Twitter
export const shareBlogOnTwitter = inngest.createFunction(
  {
    id: "share-blog-on-twitter",
    name: "Share Blog Post on Twitter",
    retries: 2
  },
  {
    event: "blog/twitter.share.requested"
  },
  async ({ event, step }) => {
    const { blogId, fromFacebook = false } = event.data;

    // Step 1: Check if Twitter is configured
    const twitterConfig = await step.run("check-twitter-config", async () => {
      const accountInfo = await getTwitterAccountInfo();

      if (!accountInfo.configured) {
        console.warn("Twitter API not configured, skipping tweet");
        return {
          configured: false,
          reason: accountInfo.message || accountInfo.error
        };
      }

      console.log(`Twitter configured for @${accountInfo.username}`);
      return {
        configured: true,
        username: accountInfo.username,
        name: accountInfo.name
      };
    });

    if (!twitterConfig.configured) {
      return {
        success: false,
        message: "Twitter not configured",
        reason: 'reason' in twitterConfig ? twitterConfig.reason : 'Not configured'
      };
    }

    // Step 2: Fetch blog content and check if already tweeted
    const blogContent = await step.run("fetch-blog-and-check-status", async (): Promise<BlogContent & { alreadyTweeted: boolean }> => {
      // Get blog content
      const result = await sql`
        SELECT
          id,
          title,
          meta_description,
          slug,
          keywords,
          image_url,
          topic,
          status
        FROM generated_content
        WHERE id = ${blogId}
          AND status = 'published'
        LIMIT 1
      `;

      if (result.length === 0) {
        throw new Error(`Published blog post not found with ID: ${blogId}`);
      }

      const blog = result[0] as BlogContent;

      // Check if already tweeted
      const alreadyTweeted = await checkIfAlreadyTweeted(blogId);

      return {
        ...blog,
        alreadyTweeted
      };
    });

    // Skip if already tweeted
    if (blogContent.alreadyTweeted) {
      console.log(`Blog ${blogId} already tweeted, skipping`);
      return {
        success: true,
        message: "Blog already tweeted",
        blogId: blogId
      };
    }

    // Step 3: Wait for image if coming from Facebook post (to ensure image is ready)
    if (fromFacebook && !blogContent.image_url) {
      await step.run("wait-for-image", async () => {
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          const checkResult = await sql`
            SELECT image_url
            FROM generated_content
            WHERE id = ${blogId}
            LIMIT 1
          `;

          if (checkResult[0]?.image_url) {
            blogContent.image_url = checkResult[0].image_url;
            console.log(`Image found for blog ${blogId}: ${blogContent.image_url}`);
            break;
          }

          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Waiting for image... Attempt ${attempts}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
          }
        }

        if (!blogContent.image_url) {
          console.warn(`Image not ready after ${maxAttempts} attempts, proceeding without image`);
        }
      });
    }

    // Step 4: Upload media to Twitter (if image exists)
    const mediaId = await step.run("upload-media-to-twitter", async () => {
      if (!blogContent.image_url) {
        console.log("No image available for tweet");
        return null;
      }

      console.log(`Uploading image to Twitter: ${blogContent.image_url}`);
      const uploadedMediaId = await uploadMediaToTwitter(blogContent.image_url);

      if (!uploadedMediaId) {
        console.warn("Failed to upload image to Twitter, posting without media");
        return null;
      }

      console.log(`Image uploaded to Twitter with media ID: ${uploadedMediaId}`);
      return uploadedMediaId;
    });

    // Step 5: Create and post tweet
    const tweetResult = await step.run("post-tweet", async () => {
      // Create tweet text
      const tweetText = createTweetText(blogContent, true);
      console.log(`Tweet text (${tweetText.length} chars): ${tweetText}`);

      // Prepare tweet data
      const tweetData = {
        text: tweetText,
        mediaIds: mediaId ? [mediaId] : undefined
      };

      // Post tweet
      const tweet = await postTweet(tweetData);

      if (!tweet) {
        throw new Error("Failed to post tweet");
      }

      console.log(`Tweet posted successfully: ${tweet.id}`);
      return {
        tweetId: tweet.id,
        tweetText: tweet.text,
        mediaId: mediaId
      };
    });

    // Step 6: Save tweet to database
    await step.run("save-tweet-to-database", async () => {
      await saveTweetToDatabase(
        blogId,
        tweetResult.tweetId,
        tweetResult.tweetText,
        tweetResult.mediaId ? [tweetResult.mediaId] : undefined,
        'published'
      );

      // Update blog metadata with tweet info
      await sql`
        UPDATE generated_content
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'),
          '{twitterPost}',
          ${JSON.stringify({
            tweetId: tweetResult.tweetId,
            postedAt: new Date().toISOString(),
            tweetUrl: `https://twitter.com/i/web/status/${tweetResult.tweetId}`,
            hasMedia: !!tweetResult.mediaId
          })}::jsonb
        )
        WHERE id = ${blogId}
      `;

      console.log(`Tweet data saved for blog ${blogId}`);
    });

    // Step 7: Log the operation
    await step.run("log-twitter-post", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'social.twitter.posted',
          'social_media',
          'completed',
          ${JSON.stringify({
            blogId: blogId,
            tweetId: tweetResult.tweetId,
            title: blogContent.title
          })},
          ${JSON.stringify({
            platform: 'twitter',
            tweetUrl: `https://twitter.com/i/web/status/${tweetResult.tweetId}`,
            hasMedia: !!mediaId,
            fromFacebook: fromFacebook,
            postedAt: new Date().toISOString()
          })}
        )
      `;
    });

    return {
      success: true,
      blogId: blogId,
      tweetId: tweetResult.tweetId,
      tweetUrl: `https://twitter.com/i/web/status/${tweetResult.tweetId}`,
      hasMedia: !!mediaId,
      postedAt: new Date().toISOString()
    };
  }
);

// Bulk share recent blogs on Twitter (manual trigger)
export const bulkShareOnTwitter = inngest.createFunction(
  {
    id: "bulk-share-on-twitter",
    name: "Bulk Share Recent Blogs on Twitter",
    retries: 1
  },
  {
    event: "twitter/bulk.share"
  },
  async ({ event, step }) => {
    const { limit = 5, skipExisting = true } = event.data;

    // Step 1: Check Twitter configuration
    const isConfigured = await step.run("check-twitter-configured", async () => {
      return isTwitterConfigured();
    });

    if (!isConfigured) {
      return {
        success: false,
        message: "Twitter API not configured"
      };
    }

    // Step 2: Get recent published blogs that haven't been tweeted
    const blogsToShare = await step.run("get-blogs-to-share", async () => {
      let query;

      if (skipExisting) {
        // Get blogs that haven't been tweeted yet
        query = sql`
          SELECT gc.id, gc.title, gc.slug
          FROM generated_content gc
          LEFT JOIN social_media_posts smp
            ON gc.id = smp.content_id AND smp.platform = 'twitter'
          WHERE gc.status = 'published'
            AND gc.image_url IS NOT NULL
            AND smp.id IS NULL
          ORDER BY gc.created_at DESC
          LIMIT ${limit}
        `;
      } else {
        // Get all recent published blogs
        query = sql`
          SELECT id, title, slug
          FROM generated_content
          WHERE status = 'published'
            AND image_url IS NOT NULL
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
      }

      const blogs = await query;
      console.log(`Found ${blogs.length} blogs to share on Twitter`);
      return blogs;
    });

    if (blogsToShare.length === 0) {
      return {
        success: true,
        message: "No blogs to share",
        shared: 0
      };
    }

    // Step 3: Share each blog with delay
    const results: Array<{ blogId: string, title: string, queued: boolean }> = [];
    for (let i = 0; i < blogsToShare.length; i++) {
      const blog = blogsToShare[i];

      const shareResult = await step.run(`share-blog-${blog.id}`, async () => {
        console.log(`Sharing blog ${i + 1}/${blogsToShare.length}: ${blog.title}`);

        // Send event to share this blog
        await inngest.send({
          name: "blog/twitter.share.requested",
          data: {
            blogId: blog.id,
            fromFacebook: false
          }
        });

        // Add delay between tweets (30 seconds)
        if (i < blogsToShare.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 30000));
        }

        return {
          blogId: blog.id,
          title: blog.title,
          queued: true
        };
      });

      results.push(shareResult);
    }

    // Step 4: Log bulk operation
    await step.run("log-bulk-share", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'twitter.bulk.share',
          'social_media',
          'completed',
          ${JSON.stringify({
            blogsQueued: results.length,
            blogIds: results.map(r => r.blogId)
          })},
          ${JSON.stringify({
            limit: limit,
            skipExisting: skipExisting,
            timestamp: new Date().toISOString()
          })}
        )
      `;
    });

    return {
      success: true,
      message: `Queued ${results.length} blogs for Twitter sharing`,
      shared: results.length,
      blogs: results
    };
  }
);

// Monitor Twitter API health - REMOVED: No longer needed