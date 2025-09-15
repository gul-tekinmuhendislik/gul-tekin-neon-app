import { TwitterApi } from 'twitter-api-v2';
import { sql } from './db';

// Initialize Twitter client
export function getTwitterClient() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || '',
    appSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
  });

  return client;
}

// Check if Twitter is configured
export function isTwitterConfigured(): boolean {
  return !!(
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET
  );
}

// Interface for tweet data
export interface TweetData {
  text: string;
  mediaIds?: string[];
  link?: string;
}

// Interface for blog content
export interface BlogContent {
  id: number;
  title: string;
  meta_description?: string;
  slug: string;
  keywords?: string[];
  image_url?: string;
  topic?: string;
}

// Create tweet text from blog content
export function createTweetText(blog: BlogContent, includeLink: boolean = true): string {
  // Create a concise tweet text
  let tweetText = '';

  // Use title or meta description for main text
  const mainText = blog.meta_description || blog.title;

  // Truncate if needed (leaving room for link and hashtags)
  const maxMainTextLength = includeLink ? 200 : 250;
  if (mainText.length > maxMainTextLength) {
    tweetText = mainText.substring(0, maxMainTextLength - 3) + '...';
  } else {
    tweetText = mainText;
  }

  // Add relevant hashtags from keywords
  const hashtags: string[] = [];
  if (blog.keywords && blog.keywords.length > 0) {
    // Take first 3 keywords as hashtags
    const hashtagKeywords = blog.keywords.slice(0, 3);
    hashtagKeywords.forEach(keyword => {
      // Clean and format as hashtag
      const hashtag = '#' + keyword.replace(/\s+/g, '').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '');
      if (hashtag.length > 1 && hashtag.length < 30) {
        hashtags.push(hashtag);
      }
    });
  }

  // Add default hashtags
  hashtags.push('#GülTekinMühendislik', '#Bodrum');

  // Add hashtags to tweet
  const hashtagText = hashtags.slice(0, 5).join(' ');
  tweetText = `${tweetText}\n\n${hashtagText}`;

  // Add link if requested
  if (includeLink) {
    const blogUrl = `https://gul-tekinmuhendislik.com/blog/${blog.slug}`;
    tweetText = `${tweetText}\n\n${blogUrl}`;
  }

  // Ensure tweet is within Twitter's character limit (280 chars)
  if (tweetText.length > 280) {
    // Trim and rebuild
    const linkPart = includeLink ? `\n\nhttps://gul-tekinmuhendislik.com/blog/${blog.slug}` : '';
    const hashtagPart = `\n\n${hashtags.slice(0, 3).join(' ')}`;
    const maxMainLength = 280 - linkPart.length - hashtagPart.length - 10;

    const trimmedMain = mainText.substring(0, maxMainLength) + '...';
    tweetText = `${trimmedMain}${hashtagPart}${linkPart}`;
  }

  return tweetText;
}

// Upload media to Twitter
export async function uploadMediaToTwitter(imageUrl: string): Promise<string | null> {
  try {
    const client = getTwitterClient();

    // Download image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status}`);
      return null;
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // Upload to Twitter
    const mediaId = await client.v1.uploadMedia(imageBuffer, {
      mimeType: 'image/png',
    });

    console.log(`Media uploaded to Twitter with ID: ${mediaId}`);
    return mediaId;
  } catch (error) {
    console.error('Error uploading media to Twitter:', error);
    return null;
  }
}

// Post tweet with optional media
export async function postTweet(tweetData: TweetData): Promise<{ id: string; text: string } | null> {
  try {
    const client = getTwitterClient();

    // Prepare tweet parameters
    const tweetParams: any = {
      text: tweetData.text,
    };

    // Add media if provided
    if (tweetData.mediaIds && tweetData.mediaIds.length > 0) {
      tweetParams.media = {
        media_ids: tweetData.mediaIds,
      };
    }

    // Send tweet
    const tweet = await client.v2.tweet(tweetParams);

    console.log(`Tweet posted successfully: ${tweet.data.id}`);
    return {
      id: tweet.data.id,
      text: tweet.data.text || tweetData.text,
    };
  } catch (error) {
    console.error('Error posting tweet:', error);
    return null;
  }
}

// Save tweet to database
export async function saveTweetToDatabase(
  contentId: number,
  tweetId: string,
  tweetText: string,
  mediaIds?: string[],
  status: 'published' | 'failed' = 'published'
): Promise<void> {
  try {
    await sql`
      INSERT INTO social_media_posts (
        content_id,
        platform,
        post_id,
        post_content,
        post_url,
        media_urls,
        status,
        posted_at,
        created_at,
        updated_at
      ) VALUES (
        ${contentId},
        'twitter',
        ${tweetId},
        ${tweetText},
        ${`https://twitter.com/i/web/status/${tweetId}`},
        ${mediaIds || []},
        ${status},
        ${new Date().toISOString()},
        ${new Date().toISOString()},
        ${new Date().toISOString()}
      )
      ON CONFLICT (content_id, platform)
      DO UPDATE SET
        post_id = EXCLUDED.post_id,
        post_content = EXCLUDED.post_content,
        post_url = EXCLUDED.post_url,
        media_urls = EXCLUDED.media_urls,
        status = EXCLUDED.status,
        posted_at = EXCLUDED.posted_at,
        updated_at = ${new Date().toISOString()}
    `;

    console.log(`Tweet saved to database for content ${contentId}`);
  } catch (error) {
    console.error('Error saving tweet to database:', error);
    throw error;
  }
}

// Check if content was already tweeted
export async function checkIfAlreadyTweeted(contentId: number): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id, post_id, status
      FROM social_media_posts
      WHERE content_id = ${contentId}
        AND platform = 'twitter'
        AND status IN ('published', 'scheduled')
      LIMIT 1
    `;

    return result.length > 0;
  } catch (error) {
    console.error('Error checking tweet status:', error);
    return false;
  }
}

// Get Twitter account info (for verification)
export async function getTwitterAccountInfo() {
  try {
    if (!isTwitterConfigured()) {
      return {
        configured: false,
        message: 'Twitter API credentials not configured',
      };
    }

    const client = getTwitterClient();
    const user = await client.v2.me();

    return {
      configured: true,
      username: user.data.username,
      name: user.data.name,
      id: user.data.id,
    };
  } catch (error) {
    console.error('Error getting Twitter account info:', error);
    return {
      configured: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}