import { inngest } from "./client";
import { sql } from "@/lib/db";
import { TwitterApi } from 'twitter-api-v2';

// Twitter client'ı başlat
function getTwitterClient() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });

  return client.v2;
}

// Tweet gönderme fonksiyonu
async function postTweet(text: string, mediaIds?: string[]) {
  const client = getTwitterClient();

  try {
    // Twitter API v2 media_ids type'ı tuple bekliyor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tweetData: any = { text };

    if (mediaIds && mediaIds.length > 0) {
      // Maximum 4 media destekleniyor
      const validMediaIds = mediaIds.slice(0, 4);
      tweetData.media = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        media_ids: validMediaIds as any
      };
    }

    const tweet = await client.tweet(tweetData);

    return {
      success: true,
      tweetId: tweet.data.id,
      text: tweet.data.text,
    };
  } catch (error) {
    console.error('Error posting tweet:', error);
    throw error;
  }
}

// Görsel yükleme fonksiyonu
async function uploadMedia(imageUrl: string): Promise<string> {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  });

  try {
    // Görseli URL'den indir
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    // Twitter'a yükle
    const mediaId = await client.v1.uploadMedia(Buffer.from(buffer), {
      mimeType: 'image/jpeg',
    });

    return mediaId;
  } catch (error) {
    console.error('Error uploading media to Twitter:', error);
    throw error;
  }
}

// Blog içeriğini Twitter'da paylaş
export const shareBlogOnTwitter = inngest.createFunction(
  {
    id: "share-blog-on-twitter",
    name: "Share Blog Post on Twitter",
    retries: 2,
  },
  { event: "blog/twitter.share.requested" },
  async ({ event, step }) => {
    const { blogId, customText } = event.data as {
      blogId: number;
      customText?: string;
    };

    // Step 1: Blog içeriğini al
    const blogPost = await step.run("get-blog-post", async () => {
      const result = await sql`
        SELECT
          id,
          title,
          content,
          topic,
          image_url,
          slug
        FROM generated_content
        WHERE id = ${blogId}
      `;

      if (result.length === 0) {
        throw new Error(`Blog post with ID ${blogId} not found`);
      }

      return result[0];
    });

    // Step 2: Tweet metnini hazırla
    const tweetText = await step.run("prepare-tweet-text", async () => {
      if (customText) {
        return customText;
      }

      // Blog başlığından tweet metni oluştur
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
      const blogUrl = `${baseUrl}/blog/${blogPost.slug}`;

      // Tweet karakter limiti 280, URL için yer bırak
      const maxTextLength = 250;
      let text = blogPost.title;

      if (text.length > maxTextLength) {
        text = text.substring(0, maxTextLength - 3) + '...';
      }

      // Hashtag'ler ekle
      const hashtags = ['#blog', `#${blogPost.topic.replace(/\s+/g, '')}`];

      return `${text}\n\n${hashtags.join(' ')}\n\n${blogUrl}`;
    });

    // Step 3: Görsel varsa Twitter'a yükle
    let mediaId: string | undefined;
    if (blogPost.image_url) {
      const result = await step.run("upload-image-to-twitter", async () => {
        try {
          const id = await uploadMedia(blogPost.image_url || '');
          return id;
        } catch (error) {
          console.error('Failed to upload image, continuing without image:', error);
          return undefined;
        }
      });
      mediaId = result || undefined;
    }

    // Step 4: Tweet'i gönder
    const tweetResult = await step.run("post-tweet", async () => {
      const mediaIds = mediaId ? [mediaId] : undefined;
      return await postTweet(tweetText, mediaIds);
    });

    // Step 5: Veritabanına kaydet
    await step.run("save-to-database", async () => {
      await sql`
        INSERT INTO social_media_posts (
          platform,
          post_id,
          content_id,
          content_type,
          post_text,
          post_url,
          media_urls,
          status,
          metadata,
          created_at
        ) VALUES (
          'twitter',
          ${tweetResult.tweetId},
          ${blogId},
          'blog',
          ${tweetText},
          ${`https://twitter.com/user/status/${tweetResult.tweetId}`},
          ${blogPost.image_url ? [blogPost.image_url] : null},
          'published',
          ${JSON.stringify({
            blogTitle: blogPost.title,
            blogSlug: blogPost.slug,
            mediaId: mediaId,
          })},
          ${new Date().toISOString()}
        )
      `;
    });

    // Step 6: Event log kaydet
    await step.run("log-event", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'blog.twitter.shared',
          'social_media_share',
          'success',
          ${JSON.stringify({
            blogId: blogId,
            tweetId: tweetResult.tweetId,
            tweetText: tweetText,
          })},
          ${JSON.stringify({
            blogTitle: blogPost.title,
            hasImage: !!mediaId,
            platform: 'twitter',
          })}
        )
      `;
    });

    return {
      success: true,
      tweetId: tweetResult.tweetId,
      tweetUrl: `https://twitter.com/user/status/${tweetResult.tweetId}`,
      message: `Successfully shared blog post "${blogPost.title}" on Twitter`,
    };
  }
);

// Toplu tweet gönderme (thread oluşturma)
export const createTwitterThread = inngest.createFunction(
  {
    id: "create-twitter-thread",
    name: "Create Twitter Thread",
    retries: 2,
  },
  { event: "twitter/thread.create.requested" },
  async ({ event, step }) => {
    const { tweets, replyToId } = event.data as {
      tweets: Array<{ text: string; mediaUrl?: string }>;
      replyToId?: string;
    };

    const tweetIds: string[] = [];
    let lastTweetId = replyToId;

    for (let i = 0; i < tweets.length; i++) {
      const tweet = tweets[i];

      const result = await step.run(`post-tweet-${i}`, async () => {
        let mediaId: string | undefined;

        // Görsel varsa yükle
        if (tweet.mediaUrl) {
          try {
            mediaId = await uploadMedia(tweet.mediaUrl);
          } catch (error) {
            console.error(`Failed to upload media for tweet ${i}:`, error);
          }
        }

        const client = getTwitterClient();
        const tweetData = await client.tweet({
          text: tweet.text,
          reply: lastTweetId ? { in_reply_to_tweet_id: lastTweetId } : undefined,
          media: mediaId ? { media_ids: [mediaId] } : undefined,
        });

        return tweetData.data.id;
      });

      tweetIds.push(result);
      lastTweetId = result;
    }

    // Veritabanına kaydet
    await step.run("save-thread-to-database", async () => {
      await sql`
        INSERT INTO social_media_posts (
          platform,
          post_id,
          content_type,
          post_text,
          status,
          metadata,
          created_at
        ) VALUES (
          'twitter',
          ${tweetIds.join(',')},
          'thread',
          ${tweets.map(t => t.text).join('\n---\n')},
          'published',
          ${JSON.stringify({
            tweetIds,
            tweetCount: tweets.length,
            hasMedia: tweets.some(t => t.mediaUrl),
          })},
          ${new Date().toISOString()}
        )
      `;
    });

    return {
      success: true,
      tweetIds,
      threadUrl: `https://twitter.com/user/status/${tweetIds[0]}`,
      message: `Successfully created Twitter thread with ${tweets.length} tweets`,
    };
  }
);

// Otomatik blog paylaşımı (yeni blog oluşturulduğunda)
export const autoShareNewBlogOnTwitter = inngest.createFunction(
  {
    id: "auto-share-blog-twitter",
    name: "Auto Share New Blog on Twitter",
  },
  { event: "blog/content.created" },
  async ({ event, step }) => {
    const { contentId } = event.data;

    // Twitter paylaşımı etkin mi kontrol et
    const isTwitterEnabled = process.env.NEXT_PUBLIC_ENABLE_TWITTER === 'true';
    if (!isTwitterEnabled) {
      return {
        success: false,
        message: 'Twitter sharing is disabled',
      };
    }

    // 5 dakika bekle (blog içeriği tam olarak hazır olsun)
    await step.sleep("wait-for-content", "5m");

    // Twitter'da paylaş
    await step.run("trigger-twitter-share", async () => {
      await inngest.send({
        name: "blog/twitter.share.requested",
        data: {
          blogId: contentId,
        },
      });
    });

    return {
      success: true,
      message: `Twitter share triggered for blog ID ${contentId}`,
    };
  }
);