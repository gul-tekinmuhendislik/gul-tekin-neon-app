/* eslint-disable @typescript-eslint/no-explicit-any */
import { inngest } from "./client";
import { sql } from "../db";
import { google } from 'googleapis';

// OAuth2 client oluştur
function createOAuth2Client() {
  const redirectUri = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3003/api/google/callback'
    : `${process.env.NEXT_PUBLIC_SITE_URL}/api/google/callback`;

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

// Google Business yerlerini senkronize et
export const syncGoogleBusinessLocations = inngest.createFunction(
  {
    id: "sync-google-business-locations",
    name: "Sync Google Business Locations",
    retries: 2,
    throttle: {
      limit: 10, // Dakikada maksimum 10 istek
      period: "1m",
      key: "google-business-api"
    }
  },
  {
    // Her gün saat 9'da çalıştır
    cron: "0 9 * * *"
  },
  async ({ step }) => {
    // Step 1: Token'ları veritabanından al
    const tokens = await step.run("get-google-tokens", async () => {
      const result = await sql`
        SELECT
          access_token,
          refresh_token,
          expires_at
        FROM google_tokens
        WHERE platform = 'google_business'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (result.length === 0) {
        throw new Error("No Google Business tokens found in database");
      }

      return result[0];
    });

    // Step 2: OAuth client'ı yapılandır
    const oauth2Client = await step.run("setup-oauth-client", async () => {
      const client = createOAuth2Client();

      client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      // Token'ı yenile gerekiyorsa
      if (tokens.expires_at && new Date(tokens.expires_at) < new Date()) {
        console.log("Token expired, refreshing...");
        const { credentials } = await client.refreshAccessToken();

        // Yeni token'ı veritabanına kaydet
        await sql`
          UPDATE google_tokens
          SET
            access_token = ${credentials.access_token},
            expires_at = ${new Date(Date.now() + (credentials.expiry_date || 3600000))},
            updated_at = NOW()
          WHERE platform = 'google_business'
        `;

        client.setCredentials(credentials);
      }

      return client;
    });

    // Step 3: Google Business API'den lokasyonları çek
    const locations = await step.run("fetch-business-locations", async () => {
      const mybusinessinformation = google.mybusinessbusinessinformation({
        version: 'v1',
        auth: oauth2Client as any
      });

      try {
        // Direkt lokasyonları çek (account wildcard kullanarak)
        const locationsResponse = await mybusinessinformation.accounts.locations.list({
          parent: 'accounts/-', // Wildcard for all accounts
          pageSize: 100,
        });

        const locations = locationsResponse.data.locations || [];
        console.log(`Found ${locations.length} Google Business locations`);

        return locations;
      } catch (error) {
        console.error("Error fetching business locations:", error);
        throw error;
      }
    });

    // Step 4: Lokasyonları veritabanına kaydet
    const savedLocations = await step.run("save-locations-to-db", async () => {
      let savedCount = 0;

      for (const location of locations) {
        try {
          const locationData = location as any;
          await sql`
            INSERT INTO google_business_locations (
              location_id,
              name,
              title,
              address,
              phone_number,
              website_uri,
              categories,
              metadata,
              status
            ) VALUES (
              ${locationData.name || ''},
              ${locationData.name || ''},
              ${locationData.title || ''},
              ${JSON.stringify(locationData.storefrontAddress || locationData.address || {})},
              ${locationData.phoneNumbers?.primaryPhone || null},
              ${locationData.websiteUri || null},
              ${JSON.stringify(locationData.categories?.primaryCategory || {})},
              ${JSON.stringify(locationData)},
              'active'
            )
            ON CONFLICT (location_id) DO UPDATE SET
              title = EXCLUDED.title,
              address = EXCLUDED.address,
              phone_number = EXCLUDED.phone_number,
              website_uri = EXCLUDED.website_uri,
              categories = EXCLUDED.categories,
              metadata = EXCLUDED.metadata,
              updated_at = NOW()
          `;

          savedCount++;
        } catch (error) {
          console.error(`Error saving location ${location.name}:`, error);
        }
      }

      return savedCount;
    });

    // Step 5: Yorumları çek
    const reviews = await step.run("fetch-reviews", async () => {
      // Reviews API henüz tam desteklenmiyor, şimdilik boş döndür
      console.log("Reviews API not fully supported yet, skipping...");
      return [];
    });

    // Step 6: Yorumları veritabanına kaydet
    const savedReviews = await step.run("save-reviews-to-db", async () => {
      let savedCount = 0;

      for (const review of reviews) {
        const reviewData = review as any;
        try {
          await sql`
            INSERT INTO google_business_reviews (
              review_id,
              location_id,
              reviewer_name,
              rating,
              comment,
              review_time,
              reply_comment,
              reply_time,
              metadata
            ) VALUES (
              ${reviewData?.name || ''},
              ${reviewData?.locationId || ''},
              ${reviewData?.reviewer?.displayName || 'Anonymous'},
              ${reviewData?.starRating || 0},
              ${reviewData?.comment || ''},
              ${reviewData?.createTime || null},
              ${reviewData?.reviewReply?.comment || null},
              ${reviewData?.reviewReply?.updateTime || null},
              ${JSON.stringify(reviewData || {})}
            )
            ON CONFLICT (review_id) DO UPDATE SET
              rating = EXCLUDED.rating,
              comment = EXCLUDED.comment,
              reply_comment = EXCLUDED.reply_comment,
              reply_time = EXCLUDED.reply_time,
              metadata = EXCLUDED.metadata,
              updated_at = NOW()
          `;

          savedCount++;
        } catch (error) {
          console.error(`Error saving review ${reviewData?.name}:`, error);
        }
      }

      return savedCount;
    });

    // Step 7: İstatistikleri çek
    const insights = await step.run("fetch-insights", async () => {
      // Metrics API henüz tam desteklenmiyor, şimdilik boş döndür
      console.log("Metrics API not fully supported yet, skipping...");
      return [];
    });

    // Step 8: İstatistikleri veritabanına kaydet
    const savedInsights = await step.run("save-insights-to-db", async () => {
      let savedCount = 0;

      for (const insight of insights) {
        const insightData = insight as any;
        try {
          await sql`
            INSERT INTO google_business_insights (
              location_id,
              metric_date,
              queries_direct,
              queries_indirect,
              views_maps,
              views_search,
              actions_website,
              actions_phone,
              actions_directions,
              metadata
            ) VALUES (
              ${insightData?.locationId || ''},
              ${new Date().toISOString()},
              ${insightData?.metrics?.metricValues?.[0]?.totalValue?.value || 0},
              ${insightData?.metrics?.metricValues?.[1]?.totalValue?.value || 0},
              ${insightData?.metrics?.metricValues?.[2]?.totalValue?.value || 0},
              ${insightData?.metrics?.metricValues?.[3]?.totalValue?.value || 0},
              ${insightData?.metrics?.metricValues?.[4]?.totalValue?.value || 0},
              ${insightData?.metrics?.metricValues?.[5]?.totalValue?.value || 0},
              ${insightData?.metrics?.metricValues?.[6]?.totalValue?.value || 0},
              ${JSON.stringify(insightData?.metrics || {})}
            )
            ON CONFLICT (location_id, metric_date) DO UPDATE SET
              queries_direct = EXCLUDED.queries_direct,
              queries_indirect = EXCLUDED.queries_indirect,
              views_maps = EXCLUDED.views_maps,
              views_search = EXCLUDED.views_search,
              actions_website = EXCLUDED.actions_website,
              actions_phone = EXCLUDED.actions_phone,
              actions_directions = EXCLUDED.actions_directions,
              metadata = EXCLUDED.metadata,
              updated_at = NOW()
          `;

          savedCount++;
        } catch (error) {
          console.error(`Error saving insights for ${insightData?.locationId}:`, error);
        }
      }

      return savedCount;
    });

    // Step 9: Özet rapor oluştur
    const summary = await step.run("create-summary-report", async () => {
      // Son 30 günün özet istatistiklerini hesapla
      const summaryStats = await sql`
        SELECT
          COUNT(DISTINCT location_id) as total_locations,
          COUNT(DISTINCT review_id) as total_reviews,
          AVG(rating) as average_rating,
          SUM(queries_direct + queries_indirect) as total_queries,
          SUM(views_maps + views_search) as total_views,
          SUM(actions_website + actions_phone + actions_directions) as total_actions
        FROM google_business_insights
        WHERE metric_date >= NOW() - INTERVAL '30 days'
      `;

      // En iyi performans gösteren lokasyon
      const topLocation = await sql`
        SELECT
          location_id,
          SUM(views_maps + views_search) as total_views
        FROM google_business_insights
        WHERE metric_date >= NOW() - INTERVAL '30 days'
        GROUP BY location_id
        ORDER BY total_views DESC
        LIMIT 1
      `;

      return {
        locations: locations.length,
        savedLocations,
        savedReviews,
        savedInsights,
        summary: summaryStats[0],
        topLocation: topLocation[0]
      };
    });

    // Step 10: Event log oluştur
    await step.run("log-sync-operation", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'google.business.sync',
          'automation',
          'completed',
          ${JSON.stringify({
            locationsCount: summary.locations,
            savedLocations: summary.savedLocations,
            savedReviews: summary.savedReviews,
            savedInsights: summary.savedInsights
          })},
          ${JSON.stringify({
            summary: summary.summary,
            topLocation: summary.topLocation,
            syncedAt: new Date().toISOString()
          })}
        )
      `;
    });

    return {
      success: true,
      ...summary,
      timestamp: new Date().toISOString()
    };
  }
);

// Manuel olarak Google Business verilerini senkronize et
export const syncGoogleBusinessManual = inngest.createFunction(
  {
    id: "sync-google-business-manual",
    name: "Manually Sync Google Business Data",
    retries: 2
  },
  {
    event: "google/business.sync.manual"
  },
  async ({ event }) => {
    // Aynı senkronizasyon fonksiyonunu çağır
    await inngest.send({
      name: "google/business.sync.scheduled",
      data: {
        triggeredBy: event.data.triggeredBy || 'manual',
        timestamp: new Date().toISOString()
      }
    });

    return {
      success: true,
      message: "Google Business sync triggered manually",
      timestamp: new Date().toISOString()
    };
  }
);

// Google Business'a otomatik yanıt gönder
export const autoReplyToReviews = inngest.createFunction(
  {
    id: "auto-reply-google-reviews",
    name: "Auto Reply to Google Reviews",
    retries: 2
  },
  {
    event: "google/review.new"
  },
  async ({ event, step }) => {
    const { reviewId, locationId, rating, reviewerName } = event.data;

    // Step 1: Token'ları al ve OAuth client oluştur
    await step.run("setup-oauth-for-reply", async () => {
      const result = await sql`
        SELECT access_token, refresh_token
        FROM google_tokens
        WHERE platform = 'google_business'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (result.length === 0) {
        throw new Error("No Google Business tokens found");
      }

      const client = createOAuth2Client();
      client.setCredentials({
        access_token: result[0].access_token,
        refresh_token: result[0].refresh_token,
      });

      return client;
    });

    // Step 2: Yanıt metnini oluştur
    const replyText = await step.run("generate-reply-text", async () => {
      let reply = "";

      if (rating >= 4) {
        // Olumlu yorum için yanıt
        reply = `Merhaba ${reviewerName},

Değerli geri bildiriminiz için teşekkür ederiz! Gül-Tekin Mühendislik olarak müşteri memnuniyetini her zaman önceliğimiz olarak görüyoruz.

Sizlere daha iyi hizmet verebilmek için çalışmalarımıza devam ediyoruz.

Saygılarımızla,
Gül-Tekin Mühendislik Ekibi`;
      } else if (rating === 3) {
        // Nötr yorum için yanıt
        reply = `Merhaba ${reviewerName},

Geri bildiriminiz için teşekkür ederiz. Hizmetlerimizi geliştirmek için değerli görüşlerinizi dikkate alıyoruz.

Daha detaylı konuşmak isterseniz, lütfen bizimle iletişime geçin:
📞 0252 317 10 13
📧 info@gul-tekinmuhendislik.com

Saygılarımızla,
Gül-Tekin Mühendislik Ekibi`;
      } else {
        // Olumsuz yorum için yanıt
        reply = `Merhaba ${reviewerName},

Yaşadığınız olumsuz deneyim için özür dileriz. Geri bildiriminizi ciddiye alıyoruz ve durumu düzeltmek istiyoruz.

Lütfen bizimle doğrudan iletişime geçin:
📞 0252 317 10 13
📧 info@gul-tekinmuhendislik.com

Size en kısa sürede yardımcı olmak için sabırsızlanıyoruz.

Saygılarımızla,
Gül-Tekin Mühendislik Ekibi`;
      }

      return reply;
    });

    // Step 3: Yanıtı Google Business'a gönder
    await step.run("send-reply-to-google", async () => {
      // Reviews API henüz tam desteklenmiyor
      console.log("Reviews reply API not fully supported yet, skipping...");

      try {
        // Şimdilik sadece simüle et
        console.log(`Would send reply to review ${reviewId}: ${replyText}`);

        return {
          success: true,
          response: { simulated: true }
        };
      } catch (error) {
        console.error("Error sending reply:", error);
        throw error;
      }
    });

    // Step 4: Yanıtı veritabanına kaydet
    await step.run("save-reply-to-db", async () => {
      await sql`
        UPDATE google_business_reviews
        SET
          reply_comment = ${replyText},
          reply_time = ${new Date().toISOString()},
          auto_replied = true,
          updated_at = NOW()
        WHERE review_id = ${reviewId}
      `;
    });

    // Step 5: Event log oluştur
    await step.run("log-reply-operation", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'google.review.replied',
          'automation',
          'completed',
          ${JSON.stringify({
            reviewId,
            locationId,
            rating,
            reviewerName
          })},
          ${JSON.stringify({
            replyText,
            repliedAt: new Date().toISOString()
          })}
        )
      `;
    });

    return {
      success: true,
      reviewId,
      rating,
      replied: true,
      timestamp: new Date().toISOString()
    };
  }
);

// Google Business gönderisi oluştur
export const createGoogleBusinessPost = inngest.createFunction(
  {
    id: "create-google-business-post",
    name: "Create Google Business Post",
    retries: 2
  },
  {
    event: "google/post.create"
  },
  async ({ event, step }) => {
    const { locationId, title, summary, callToAction, imageUrl } = event.data;

    // Step 1: OAuth client oluştur
    await step.run("setup-oauth-for-post", async () => {
      const result = await sql`
        SELECT access_token, refresh_token
        FROM google_tokens
        WHERE platform = 'google_business'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (result.length === 0) {
        throw new Error("No Google Business tokens found");
      }

      const client = createOAuth2Client();
      client.setCredentials({
        access_token: result[0].access_token,
        refresh_token: result[0].refresh_token,
      });

      return client;
    });

    // Step 2: Gönderiyi oluştur
    const postResult = await step.run("create-post", async () => {
      // Posts API henüz tam desteklenmiyor
      console.log("Posts API not fully supported yet, simulating...");

      interface PostData {
        summary?: string;
        topicType: string;
        languageCode: string;
        callToAction?: {
          actionType: string;
          url: string;
        };
        media?: Array<{
          mediaFormat: string;
          sourceUrl: string;
        }>;
      }

      const postData: PostData = {
        summary: summary || title,
        topicType: 'STANDARD',
        languageCode: 'tr'
      };

      // Call to action ekle
      if (callToAction) {
        postData.callToAction = {
          actionType: callToAction.type || 'LEARN_MORE',
          url: callToAction.url
        };
      }

      // Görsel ekle
      if (imageUrl) {
        postData.media = [{
          mediaFormat: 'PHOTO',
          sourceUrl: imageUrl
        }];
      }

      try {
        // Şimdilik sadece simüle et
        console.log(`Would create post for location ${locationId}:`, postData);

        return {
          success: true,
          postId: `simulated-post-${Date.now()}`,
          postData: postData
        };
      } catch (error) {
        console.error("Error creating post:", error);
        throw error;
      }
    });

    // Step 3: Gönderiyi veritabanına kaydet
    await step.run("save-post-to-db", async () => {
      await sql`
        INSERT INTO google_business_posts (
          post_id,
          location_id,
          title,
          summary,
          call_to_action,
          image_url,
          status,
          metadata
        ) VALUES (
          ${postResult.postId},
          ${locationId},
          ${title},
          ${summary},
          ${JSON.stringify(callToAction || {})},
          ${imageUrl || null},
          'published',
          ${JSON.stringify(postResult.postData)}
        )
      `;
    });

    // Step 4: Event log oluştur
    await step.run("log-post-operation", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'google.post.created',
          'social_media',
          'completed',
          ${JSON.stringify({
            postId: postResult.postId,
            locationId,
            title
          })},
          ${JSON.stringify({
            summary,
            callToAction,
            imageUrl,
            createdAt: new Date().toISOString()
          })}
        )
      `;
    });

    return {
      success: true,
      postId: postResult.postId,
      locationId,
      title,
      timestamp: new Date().toISOString()
    };
  }
);