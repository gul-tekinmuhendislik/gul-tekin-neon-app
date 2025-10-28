import { inngest } from "./client";
import { sql } from "../db";
import { 
  getFacebookPageAccessToken, 
  postToFacebookPage, 
  extractOGData, 
  saveFacebookPost 
} from "../facebook-api";

// Her gün bir blog gönderisi paylaşma fonksiyonu
export const autoPostBlogToFacebook = inngest.createFunction(
  {
    id: "auto-post-blog-facebook",
    name: "Auto Post Blog to Facebook Daily",
    retries: 2
  },
  {
    // Her gün saat 14:00'da çalış
    cron: "0 14 * * *"
  },
  async ({ step }) => {
    // Step 1: En eski paylaşılmamış blog gönderisini bul
    const content = await step.run("find-unpublished-content", async () => {
      const result = await sql`
        WITH posted_content AS (
          SELECT content_id 
          FROM social_media_posts 
          WHERE platform = 'facebook'
        )
        SELECT 
          gc.id,
          gc.topic,
          gc.title,
          gc.content,
          gc.slug,
          gc.meta_title,
          gc.meta_description,
          gc.keywords,
          gc.status,
          gc.image_url,
          gc.created_at
        FROM generated_content gc
        LEFT JOIN posted_content pc ON gc.id = pc.content_id
        WHERE 
          gc.status = 'published'
          AND pc.content_id IS NULL
        ORDER BY gc.created_at ASC
        LIMIT 1
      `;
      
      if (result.length === 0) {
        console.log("No unpublished content found");
        return null;
      }
      
      return result[0];
    });
    
    if (!content) {
      return {
        success: false,
        message: "No unpublished content available"
      };
    }

    // Step 2: Facebook kimlik bilgilerini al
    const credentials = await step.run("get-facebook-credentials", async () => {
      const creds = await getFacebookPageAccessToken();
      
      if (!creds) {
        throw new Error("Facebook credentials not available");
      }
      
      return creds;
    });

    // Step 3: Paylaşım verilerini hazırla
    const postData = await step.run("prepare-facebook-post", async () => {
      // Open Graph verilerini çıkar
      const ogData = extractOGData({
        title: content.meta_title || content.title,
        meta_description: content.meta_description,
        slug: content.slug,
        keywords: content.keywords,
        image_url: content.image_url
      });
      
      return ogData;
    });

    // Step 4: Facebook'ta paylaş
    const facebookResponse = await step.run("post-to-facebook", async () => {
      try {
        const response = await postToFacebookPage(
          postData,
          credentials.accessToken,
          credentials.pageId
        );
        
        if (!response) {
          throw new Error("Failed to post to Facebook");
        }
        
        return {
          postId: response.id,
          status: "published" as const
        };
      } catch (error) {
        console.error("Error posting to Facebook:", error);
        
        await saveFacebookPost(
          content.id,
          "failed",
          postData,
          "failed"
        );
        
        throw error;
      }
    });

    // Step 5: Veritabanına paylaşım bilgilerini kaydet
    await step.run("save-post-data", async () => {
      await saveFacebookPost(
        content.id,
        facebookResponse.postId,
        postData,
        facebookResponse.status
      );
      
      // İçerik metadata'sını güncelle
      await sql`
        UPDATE generated_content
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'),
          '{facebookPost}',
          ${JSON.stringify({
            postId: facebookResponse.postId,
            postedAt: new Date().toISOString(),
            link: postData.link,
            status: facebookResponse.status
          })}::jsonb
        )
        WHERE id = ${content.id}
      `;
    });

    // Step 6: Log kaydı
    await step.run("log-facebook-post", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'social.facebook.auto.posted',
          'social_media',
          'completed',
          ${JSON.stringify({
            contentId: content.id,
            postId: facebookResponse.postId,
            title: content.title
          })},
          ${JSON.stringify({
            platform: 'facebook',
            link: postData.link,
            postedAt: new Date().toISOString(),
            contentId: content.id,
            autoPosted: true
          })}
        )
      `;
    });

    // Step 7: Twitter paylaşımını tetikle
    await step.run("trigger-twitter-post", async () => {
      const twitterEnabled = process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN;

      if (twitterEnabled) {
        await inngest.send({
          name: "blog/twitter.share.requested",
          data: {
            blogId: content.id,
            fromFacebook: true,
            autoPosted: true
          }
        });

        console.log(`Twitter share triggered for content ${content.id}`);
      }
    });

    return {
      success: true,
      contentId: content.id,
      title: content.title,
      postId: facebookResponse.postId,
      status: facebookResponse.status,
      link: postData.link,
      postedAt: new Date().toISOString()
    };
  }
);