import { sql } from "./db";

// Facebook Graph API configuration
const FACEBOOK_GRAPH_API_URL = "https://graph.facebook.com/v23.0";

interface FacebookPagePost {
  message: string;
  link?: string;
  published?: boolean;
  scheduled_publish_time?: number;
}

interface FacebookPostResponse {
  id: string;
  post_id?: string;
}

// Removed unused interface

interface FacebookPostData {
  title: string;
  excerpt: string;
  link: string;
  imageUrl?: string;
  hashtags?: string[];
}

// Generate Open Graph compliant image URL
export function generateOGImageUrl(slug: string, title: string): string {
  // Using the Next.js OG Image Generation API
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gul-tekinmuhendislik.com";
  
  // URL encode the title for the OG image API
  const encodedTitle = encodeURIComponent(title);
  
  // OG Image generation endpoint (you'll need to create this)
  return `${baseUrl}/api/og?title=${encodedTitle}&slug=${slug}`;
}

// Format content for Facebook post
export function formatFacebookPost(data: FacebookPostData): string {
  const { title, excerpt, hashtags = [] } = data;
  
  // Create engaging post format
  let post = `🔧 ${title}\n\n`;
  post += `${excerpt}\n\n`;
  
  // Add call-to-action
  post += `📖 Detaylı bilgi için tıklayın:\n`;
  
  // Add hashtags
  if (hashtags.length > 0) {
    post += `\n${hashtags.map(tag => `#${tag}`).join(" ")}`;
  }
  
  // Add company hashtags
  post += "\n\n#GülTekinMühendislik #Bodrum #MekanikTesisat #EnerjiVerimliliği";
  
  return post;
}

// Create hashtags from keywords
export function generateHashtags(keywords: string[]): string[] {
  // Convert keywords to hashtag format
  const hashtags = keywords
    .slice(0, 5) // Limit to 5 hashtags
    .map(keyword => {
      // Remove special characters and convert to hashtag format
      return keyword
        .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]/g, "")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
    });
  
  return hashtags;
}

// Post to Facebook Page using Graph API
export async function postToFacebookPage(
  postData: FacebookPostData,
  accessToken: string,
  pageId: string
): Promise<FacebookPostResponse | null> {
  try {
    const { link, imageUrl } = postData;
    
    // Format the post message
    const message = formatFacebookPost(postData);
    
    // Prepare post data
    const post: FacebookPagePost & { picture?: string } = {
      message,
      link,
      published: true
    };
    
    // Add image if available (Facebook will also scrape og:image from the link)
    const pictureUrl = imageUrl || (postData as FacebookPostData & { picture?: string }).picture;
    if (pictureUrl) {
      post.picture = pictureUrl;
      console.log(`Adding image to Facebook post: ${post.picture}`);
    }
    
    // Make API request
    const response = await fetch(
      `${FACEBOOK_GRAPH_API_URL}/${pageId}/feed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          access_token: accessToken
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error("Facebook API Error:", error);
      throw new Error(`Facebook API Error: ${error.error?.message || "Unknown error"}`);
    }
    
    const result = await response.json() as FacebookPostResponse;
    console.log(`Facebook post created with ID: ${result.id}`);
    
    return result;
  } catch (error) {
    console.error("Error posting to Facebook:", error);
    return null;
  }
}

// Schedule a Facebook post for later
export async function scheduleFacebookPost(
  postData: FacebookPostData,
  accessToken: string,
  pageId: string,
  scheduleTime: Date
): Promise<FacebookPostResponse | null> {
  try {
    const message = formatFacebookPost(postData);
    
    // Convert schedule time to Unix timestamp
    const scheduledPublishTime = Math.floor(scheduleTime.getTime() / 1000);
    
    // Ensure schedule time is at least 10 minutes in the future
    const minScheduleTime = Math.floor(Date.now() / 1000) + 600;
    if (scheduledPublishTime < minScheduleTime) {
      throw new Error("Schedule time must be at least 10 minutes in the future");
    }
    
    const post: FacebookPagePost = {
      message,
      link: postData.link,
      published: false,
      scheduled_publish_time: scheduledPublishTime
    };
    
    const response = await fetch(
      `${FACEBOOK_GRAPH_API_URL}/${pageId}/feed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...post,
          access_token: accessToken
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error("Facebook API Error:", error);
      throw new Error(`Facebook API Error: ${error.error?.message || "Unknown error"}`);
    }
    
    const result = await response.json() as FacebookPostResponse;
    console.log(`Facebook post scheduled with ID: ${result.id}`);
    
    return result;
  } catch (error) {
    console.error("Error scheduling Facebook post:", error);
    return null;
  }
}

// Save Facebook post data to database
export async function saveFacebookPost(
  contentId: number,
  postId: string,
  postData: FacebookPostData,
  status: "published" | "scheduled" | "failed"
): Promise<void> {
  try {
    await sql`
      INSERT INTO social_media_posts (
        content_id,
        platform,
        post_id,
        post_data,
        status,
        posted_at
      ) VALUES (
        ${contentId},
        'facebook',
        ${postId},
        ${JSON.stringify(postData)},
        ${status},
        ${status === "published" ? new Date().toISOString() : null}
      )
      ON CONFLICT (content_id, platform) 
      DO UPDATE SET
        post_id = ${postId},
        post_data = ${JSON.stringify(postData)},
        status = ${status},
        posted_at = ${status === "published" ? new Date().toISOString() : null},
        updated_at = NOW()
    `;
    
    console.log(`Facebook post data saved for content ${contentId}`);
  } catch (error) {
    console.error("Error saving Facebook post data:", error);
    throw error;
  }
}

// Get Facebook page access token from database or environment
export async function getFacebookPageAccessToken(): Promise<{
  accessToken: string;
  pageId: string;
} | null> {
  try {
    // Try to get token from database first
    const { getActiveFacebookToken } = await import("./token-manager");
    const dbToken = await getActiveFacebookToken();
    
    if (dbToken && dbToken.access_token && dbToken.page_id) {
      // Validate token from database
      const isValid = await validateAccessToken(dbToken.access_token);
      if (isValid) {
        return {
          accessToken: dbToken.access_token,
          pageId: dbToken.page_id
        };
      } else {
        console.warn("Database token is invalid, falling back to environment variable");
      }
    }
    
    // Fallback to environment variable
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;
    
    if (!pageAccessToken || !pageId) {
      console.error("Facebook credentials not configured");
      return null;
    }
    
    // Validate environment token - skip validation if it fails
    let isValid = false;
    try {
      isValid = await validateAccessToken(pageAccessToken);
      if (!isValid) {
        console.warn("Facebook access token validation failed, but continuing");
      }
    } catch (validationError) {
      console.warn("Could not validate token, continuing anyway:", validationError);
    }
    
    // Save valid env token to database for future use
    if (isValid) {
      const { saveFacebookToken } = await import("./token-manager");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60); // 60 days default
      await saveFacebookToken(
        pageAccessToken,
        pageId,
        "Gül-tekin Mühendislik",
        expiresAt
      );
    }
    
    return {
      accessToken: pageAccessToken,
      pageId
    };
  } catch (error) {
    console.error("Error getting Facebook access token:", error);
    
    // Last resort: try environment variable without validation
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;
    
    if (pageAccessToken && pageId) {
      return {
        accessToken: pageAccessToken,
        pageId
      };
    }
    
    return null;
  }
}

// Validate Facebook access token
export async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${FACEBOOK_GRAPH_API_URL}/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.data?.is_valid === true;
  } catch (error) {
    console.error("Error validating access token:", error);
    return false;
  }
}

// Extract Open Graph data from content
export function extractOGData(content: {
  title: string;
  meta_description: string;
  slug: string;
  keywords?: string[];
  image_url?: string;
}): FacebookPostData {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gul-tekinmuhendislik.com";
  
  // Create excerpt from meta description
  const excerpt = content.meta_description || 
    "Bodrum'da mekanik tesisat ve enerji verimliliği çözümleri için Gül-Tekin Mühendislik'i keşfedin.";
  
  // Generate hashtags from keywords
  const hashtags = content.keywords ? generateHashtags(content.keywords) : [];
  
  // Use provided image URL or generate OG image URL
  const imageUrl = content.image_url || generateOGImageUrl(content.slug, content.title);
  
  return {
    title: content.title,
    excerpt,
    link: `${baseUrl}/blog/${content.slug}`,
    imageUrl,
    hashtags
  };
}