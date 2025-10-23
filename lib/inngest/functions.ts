import 'groq-sdk/shims/node';
import { inngest } from "./client";
import { sql } from "../db";
import Groq from "groq-sdk";
import { optimizeContentForEEAT, generateSchemaMarkup } from "../eeat-optimizer";
import { 
  getFacebookPageAccessToken, 
  postToFacebookPage, 
  extractOGData, 
  saveFacebookPost 
} from "../facebook-api";
import { 
  generateContentWithXAI, 
  generateImageWithXAI, 
  enhanceContentWithXAI,
  generatePromptForContent 
} from "./xai-content-generator";

export const helloWorld = inngest.createFunction(
  { id: "hello-world", name: "Hello World Function" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email", name: "Send Welcome Email" },
  { event: "user/signup" },
  async ({ event, step }) => {
    const { email, name } = event.data;
    
    await step.run("log-new-user", async () => {
      console.log(`New user signed up: ${name} (${email})`);
    });
    
    await step.sleep("wait-before-email", "2s");
    
    const emailSent = await step.run("send-email", async () => {
      console.log(`Sending welcome email to ${email}`);
      return { sent: true, timestamp: new Date().toISOString() };
    });
    
    return {
      success: true,
      email: email,
      emailSent: emailSent
    };
  }
);

export const processDataSync = inngest.createFunction(
  { id: "process-data-sync", name: "Process Data Sync" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const data = await step.run("fetch-data", async () => {
      console.log("Fetching data for sync...");
      return { count: Math.floor(Math.random() * 100) };
    });
    
    await step.run("process-data", async () => {
      console.log(`Processing ${data.count} items...`);
      return { processed: data.count };
    });
    
    return {
      success: true,
      itemsProcessed: data.count,
      timestamp: new Date().toISOString()
    };
  }
);

// New function to log events to Neon database
export const logEventToDatabase = inngest.createFunction(
  { 
    id: "log-event-to-database", 
    name: "Log Event to Database",
    retries: 3
  },
  { event: "app/event.log" },
  async ({ event, step }) => {
    const { eventName, eventType, payload, metadata } = event.data;
    
    // Step 1: Create event log entry
    const logEntry = await step.run("create-event-log", async () => {
      try {
        const result = await sql`
          INSERT INTO event_logs (
            event_name, 
            event_type, 
            status, 
            payload, 
            metadata
          ) VALUES (
            ${eventName || 'unknown'},
            ${eventType || 'general'},
            'processing',
            ${JSON.stringify(payload || {})},
            ${JSON.stringify(metadata || {})}
          )
          RETURNING id, event_name, created_at
        `;
        
        console.log(`Event log created with ID: ${result[0].id}`);
        return result[0];
      } catch (error) {
        console.error('Error creating event log:', error);
        throw error;
      }
    });
    
    // Step 2: Process the event (simulated processing)
    await step.sleep("process-delay", "2s");
    
    const processResult = await step.run("process-event", async () => {
      // Here you can add any custom processing logic
      console.log(`Processing event: ${logEntry.event_name}`);
      
      // Simulate some processing work
      const processingInfo = {
        processedAt: new Date().toISOString(),
        processorVersion: "1.0.0",
        nodeId: process.env.NODE_ENV || "development"
      };
      
      return processingInfo;
    });
    
    // Step 3: Update event log status
    const updateResult = await step.run("update-event-status", async () => {
      try {
        const result = await sql`
          UPDATE event_logs 
          SET 
            status = 'completed',
            processed_at = ${new Date().toISOString()},
            metadata = jsonb_set(
              COALESCE(metadata, '{}'), 
              '{processingInfo}', 
              ${JSON.stringify(processResult)}::jsonb
            ),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${logEntry.id}
          RETURNING id, status, processed_at
        `;
        
        console.log(`Event log ${logEntry.id} marked as completed`);
        return result[0];
      } catch (error) {
        console.error('Error updating event log:', error);
        
        // Mark as failed if update fails
        const errorMessage = error instanceof Error ? error.message : String(error);
        await sql`
          UPDATE event_logs 
          SET 
            status = 'failed',
            error_message = ${errorMessage},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${logEntry.id}
        `;
        
        throw error;
      }
    });
    
    // Step 4: Send notification (optional)
    if (event.data.sendNotification) {
      await step.run("send-notification", async () => {
        console.log(`Sending notification for event: ${logEntry.event_name}`);
        // Here you could integrate with email, Slack, etc.
        return { notificationSent: true };
      });
    }
    
    return {
      success: true,
      eventLogId: logEntry.id,
      eventName: logEntry.event_name,
      processedAt: updateResult.processed_at,
      processingInfo: processResult
    };
  }
);

// Exa API search and Groq content generation functions removed - no longer in use

// Content generation with Groq removed
// Process newly created content - sitemap update, SEO optimization, notifications etc.
export const processNewContent = inngest.createFunction(
  {
    id: "process-new-content",
    name: "Process New Content After Creation",
    retries: 2
  },
  {
    event: "content/created"
  },
  async ({ event, step }) => {
    const { contentId } = event.data;
    
    // Step 1: Fetch the full content from database
    const content = await step.run("fetch-content-details", async () => {
      const result = await sql`
        SELECT
          id,
          topic,
          title,
          slug,
          meta_title,
          meta_description,
          keywords,
          content,
          status,
          created_at,
          updated_at
        FROM generated_content
        WHERE id = ${contentId}
        LIMIT 1
      `;
      
      if (result.length === 0) {
        throw new Error(`Content not found with ID: ${contentId}`);
      }
      
      return result[0];
    });
    
    // Step 2: Update sitemap or trigger sitemap regeneration
    await step.run("update-sitemap", async () => {
      console.log(`Updating sitemap for new content: ${content.slug}`);
      
      // Sitemap güncellemesi için metadata kaydet
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'sitemap.update.required',
          'seo',
          'pending',
          ${JSON.stringify({
            contentId: content.id,
            slug: content.slug,
            url: `/blog/${content.slug}`
          })},
          ${JSON.stringify({
            priority: 0.8,
            changefreq: 'weekly',
            lastmod: new Date().toISOString()
          })}
        )
      `;
      
      return { sitemapUpdateScheduled: true };
    });
    
    // Step 3: Generate social media meta tags or Open Graph data
    await step.run("generate-social-meta", async () => {
      const socialMeta = {
        ogTitle: content.meta_title || content.title,
        ogDescription: content.meta_description,
        ogType: 'article',
        ogUrl: `https://gul-tekinmuhendislik.com/blog/${content.slug}`,
        twitterCard: 'summary_large_image',
        articlePublishedTime: content.created_at,
        articleAuthor: 'Gül-Tekin Mühendislik',
        articleSection: 'Mühendislik Çözümleri'
      };
      
      // Update content with social meta
      await sql`
        UPDATE generated_content
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'),
          '{socialMeta}',
          ${JSON.stringify(socialMeta)}::jsonb
        )
        WHERE id = ${content.id}
      `;
      
      return socialMeta;
    });
    
    // Step 4: E-E-A-T Analysis and Optimization with Groq
    const eeatOptimization = await step.run("eeat-analysis-optimization", async () => {
      try {
        // Perform E-E-A-T analysis and optimization
        const eeatResult = await optimizeContentForEEAT(
          content.id,
          content.content,
          content.topic,
          {
            createdAt: content.created_at || new Date().toISOString(),
            title: content.title,
            metaDescription: content.meta_description
          }
        );
        
        console.log(`E-E-A-T Analysis completed for content ${content.id}`);
        console.log(`E-E-A-T Score: ${eeatResult.analysis.overallScore}/100`);
        console.log(`YMYL Category: ${eeatResult.analysis.ymylCategory}`);
        
        // If optimization was applied, update the content
        if (eeatResult.optimizationApplied && eeatResult.optimizedContent) {
          // Append optimization suggestions to content metadata
          await sql`
            UPDATE generated_content
            SET metadata = jsonb_set(
              COALESCE(metadata, '{}'),
              '{eeatOptimizationContent}',
              ${JSON.stringify({
                applied: true,
                timestamp: new Date().toISOString(),
                suggestions: eeatResult.optimizedContent
              })}::jsonb
            )
            WHERE id = ${content.id}
          `;
        }
        
        return eeatResult;
      } catch (error) {
        console.error("E-E-A-T analysis failed:", error);
        // Return a basic analysis on error
        return {
          analysis: {
            experience: { score: 0, indicators: [], recommendations: [] },
            expertise: { score: 0, indicators: [], recommendations: [] },
            authoritativeness: { score: 0, indicators: [], recommendations: [] },
            trustworthiness: { score: 0, indicators: [], recommendations: [] },
            overallScore: 0,
            ymylCategory: true,
            contentImprovements: [],
            schemaMarkupSuggestions: []
          },
          optimizationApplied: false
        };
      }
    });
    
    // Step 5: Generate and save Schema.org markup based on E-E-A-T
    await step.run("generate-schema-markup", async () => {
      const contentData = {
        title: content.title,
        meta_description: content.meta_description,
        slug: content.slug,
        created_at: content.created_at || new Date().toISOString(),
        updated_at: content.updated_at || new Date().toISOString(),
        keywords: content.keywords
      };
      const schema = generateSchemaMarkup(contentData, eeatOptimization.analysis);
      
      // Save schema markup to database
      await sql`
        UPDATE generated_content
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'),
          '{schemaMarkup}',
          ${JSON.stringify(schema)}::jsonb
        )
        WHERE id = ${content.id}
      `;
      
      console.log(`Schema.org markup generated for content ${content.id}`);
      return schema;
    });
    
    // Step 6: Check content quality and SEO score (keeping original SEO analysis)
    const seoAnalysis = await step.run("analyze-seo-quality", async () => {
      const contentLength = content.content.length;
      const keywordCount = content.keywords ? content.keywords.length : 0;
      const hasMetaDescription = !!content.meta_description;
      const hasMetaTitle = !!content.meta_title;
      
      // Combined SEO score with E-E-A-T
      let seoScore = 0;
      if (contentLength > 2000) seoScore += 15; // İyi uzunluk
      if (keywordCount >= 10) seoScore += 15; // Yeterli anahtar kelime
      if (hasMetaDescription) seoScore += 10; // Meta açıklama var
      if (hasMetaTitle) seoScore += 10; // Meta başlık var
      
      // Add E-E-A-T score to overall SEO score (50% weight)
      const eeatContribution = Math.round(eeatOptimization.analysis.overallScore * 0.5);
      seoScore += eeatContribution;
      
      const analysis = {
        contentLength,
        keywordCount,
        hasMetaDescription,
        hasMetaTitle,
        seoScore,
        eeatScore: eeatOptimization.analysis.overallScore,
        combinedScore: seoScore,
        recommendations: [
          ...eeatOptimization.analysis.contentImprovements,
          ...(contentLength < 1500 ? ["İçerik 1500 karakterden kısa, daha detaylı yazılabilir"] : []),
          ...(keywordCount < 10 ? ["Daha fazla anahtar kelime eklenebilir"] : [])
        ]
      };
      
      // SEO analiz sonucunu kaydet
      await sql`
        UPDATE generated_content
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'),
          '{seoAnalysis}',
          ${JSON.stringify(analysis)}::jsonb
        )
        WHERE id = ${content.id}
      `;
      
      console.log(`Combined SEO Score for content ${content.id}: ${seoScore}/100`);
      console.log(`E-E-A-T Contribution: ${eeatContribution}/50`);
      return analysis;
    });
    
    // Step 7: Schedule content distribution (e.g., newsletter, social media)
    await step.run("schedule-distribution", async () => {
      // İçerik dağıtımı için event oluştur (ileride kullanılabilir)
      const distributionSchedule = {
        newsletter: {
          scheduled: false, // İleride aktif edilebilir
          scheduledFor: null
        },
        socialMedia: {
          scheduled: false, // İleride aktif edilebilir
          platforms: ['twitter', 'linkedin', 'facebook']
        }
      };
      
      await sql`
        UPDATE generated_content
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'),
          '{distribution}',
          ${JSON.stringify(distributionSchedule)}::jsonb
        )
        WHERE id = ${content.id}
      `;
      
      return distributionSchedule;
    });
    
    // Step 8: Create internal links suggestions (link to related content)
    const relatedContent = await step.run("find-related-content", async () => {
      // Aynı kategoride veya benzer konularda içerik bul
      const related = await sql`
        SELECT id, title, slug, topic
        FROM generated_content
        WHERE id != ${content.id}
          AND status = 'published'
          AND (
            topic = ${content.topic}
            OR keywords && ${content.keywords || []}
          )
        ORDER BY created_at DESC
        LIMIT 3
      `;
      
      if (related.length > 0) {
        await sql`
          UPDATE generated_content
          SET metadata = jsonb_set(
            COALESCE(metadata, '{}'),
            '{relatedContent}',
            ${JSON.stringify(related.map(r => ({
              id: r.id,
              title: r.title,
              slug: r.slug,
              url: `/blog/${r.slug}`
            })))}::jsonb
          )
          WHERE id = ${content.id}
        `;
      }
      
      return related;
    });
    
    // Step 9: Trigger E-E-A-T optimization if score is low AND trigger prompt/image generation
    await step.run("trigger-eeat-optimization-and-image", async () => {
      let optimizationTriggered = false;
      
      // Trigger E-E-A-T optimization if score is low
      if (eeatOptimization.analysis.overallScore < 75) {
        console.log(`E-E-A-T score is low (${eeatOptimization.analysis.overallScore}), triggering optimization...`);
        
        await inngest.send({
          name: "content/optimize.eeat",
          data: {
            contentId: content.id,
            eeatAnalysis: eeatOptimization.analysis,
            forceOptimization: false
          }
        });
        
        optimizationTriggered = true;
      }
      
      // ALWAYS trigger prompt and image generation for new content
      console.log(`Triggering image generation for new content ${content.id}...`);

      // Skip XAI prompt generation - generateImageForBlog creates its own prompt
      // Don't wait - let processes run asynchronously

      // Trigger image generation directly
      await inngest.send({
        name: "blog/image.generate.requested",
        data: {
          blogId: content.id,
          prompt: "", // Will use the generated prompt
          model: "vertex-ai/imagen-3.0",
          aspectRatio: "16:9",
          sampleImageSize: "2k"
        }
      });
      
      return { 
        optimizationTriggered,
        promptAndImageTriggered: true
      };
    });
    
    // Step 10: Trigger Facebook post (without waiting for image)
    await step.run("trigger-facebook-post-for-new-content", async () => {
      console.log(`Scheduling Facebook post for new content ${content.id}...`);

      // Don't wait here - let the Facebook post handler check for image
      // The postToFacebook function already has logic to wait for image
      await inngest.send({
        name: "social/facebook.post",
        data: {
          contentId: content.id,
          immediate: false // Let it handle timing internally
        }
      });

      return { facebookPostScheduled: true };
    });
    
    // Step 11: Log the processing completion
    await step.run("log-processing-complete", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'content.processed',
          'automation',
          'completed',
          ${JSON.stringify({
            contentId: content.id,
            topic: content.topic,
            slug: content.slug
          })},
          ${JSON.stringify({
            seoScore: seoAnalysis.combinedScore,
            eeatScore: eeatOptimization.analysis.overallScore,
            relatedContentCount: relatedContent.length,
            processedAt: new Date().toISOString()
          })}
        )
      `;
    });
    
    return {
      success: true,
      contentId: content.id,
      slug: content.slug,
      seoScore: seoAnalysis.combinedScore,
      eeatScore: eeatOptimization.analysis.overallScore,
      eeatAnalysis: {
        experience: eeatOptimization.analysis.experience.score,
        expertise: eeatOptimization.analysis.expertise.score,
        authoritativeness: eeatOptimization.analysis.authoritativeness.score,
        trustworthiness: eeatOptimization.analysis.trustworthiness.score,
        ymylCategory: eeatOptimization.analysis.ymylCategory
      },
      schemaMarkupGenerated: true,
      relatedContentFound: relatedContent.length,
      processedAt: new Date().toISOString()
    };
  }
);

// Apply E-E-A-T optimizations to content
export const applyEEATOptimizations = inngest.createFunction(
  {
    id: "apply-eeat-optimizations",
    name: "Apply E-E-A-T Optimizations to Content",
    retries: 2
  },
  {
    event: "content/optimize.eeat"
  },
  async ({ event, step }) => {
    const { contentId, eeatAnalysis, forceOptimization = false } = event.data;
    
    // Step 1: Fetch current content
    const content = await step.run("fetch-content-for-optimization", async () => {
      const result = await sql`
        SELECT 
          id, 
          topic, 
          title, 
          content,
          slug,
          meta_title,
          meta_description,
          keywords,
          metadata
        FROM generated_content 
        WHERE id = ${contentId}
        LIMIT 1
      `;
      
      if (result.length === 0) {
        throw new Error(`Content not found with ID: ${contentId}`);
      }
      
      return result[0];
    });
    
    // Step 2: Check if optimization is needed
    const shouldOptimize = await step.run("check-optimization-needed", async () => {
      // Skip if already optimized (unless forced)
      if (!forceOptimization && content.metadata?.eeatOptimized) {
        console.log(`Content ${contentId} already optimized, skipping...`);
        return false;
      }
      
      // Only optimize if E-E-A-T score is below 75
      const currentScore = eeatAnalysis?.overallScore || content.metadata?.eeatAnalysis?.overallScore || 0;
      if (currentScore >= 75 && !forceOptimization) {
        console.log(`Content ${contentId} has good E-E-A-T score (${currentScore}), skipping optimization...`);
        return false;
      }
      
      return true;
    });
    
    if (!shouldOptimize) {
      return {
        success: true,
        message: "Optimization not needed",
        contentId: contentId,
        currentScore: eeatAnalysis?.overallScore || content.metadata?.eeatAnalysis?.overallScore
      };
    }
    
    // Step 3: Generate optimized content with Groq
    const optimizedContent = await step.run("generate-optimized-content", async () => {
      const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
      
      const recommendations = content.metadata?.eeatAnalysis || eeatAnalysis;
      
      const optimizationPrompt = `Sen, Gül-Tekin Mühendislik için E-E-A-T optimizasyonu yapan bir içerik uzmanısın.

**Firma Bilgileri:**
- Firma: Gül-Tekin Mühendislik
- Lokasyon: Bodrum/Milas
- Deneyim: 20+ yıl sektör deneyimi
- Referanslar: 500+ tamamlanmış proje
- Uzmanlık: Isı pompaları, güneş enerjisi, su arıtma, klima sistemleri

**Mevcut E-E-A-T Skorları:**
- Experience: ${recommendations.experience?.score || 0}/25
- Expertise: ${recommendations.expertise?.score || 0}/25
- Authoritativeness: ${recommendations.authoritativeness?.score || 0}/25
- Trustworthiness: ${recommendations.trustworthiness?.score || 0}/25
- Toplam: ${recommendations.overallScore || 0}/100

**İyileştirme Önerileri:**
${JSON.stringify(recommendations.contentImprovements || [], null, 2)}

**Konu:** ${content.topic}

**Mevcut İçerik:**
${content.content}

**GÖREV:**
Bu içeriği E-E-A-T skorunu maksimuma çıkaracak şekilde YENİDEN YAZ. İçeriğe şunları ekle:

1. **Deneyim (Experience):**
   - Bodrum'da gerçek proje örnekleri
   - Somut müşteri başarı hikayeleri
   - Pratik uygulama detayları
   - "20 yıllık deneyimimizle..." gibi vurgular

2. **Uzmanlık (Expertise):**
   - Daha detaylı teknik bilgiler
   - Profesyonel terminoloji
   - Karşılaştırmalı analizler
   - Sertifika ve standart referansları (ISO 9001, CE, TSE)

3. **Otorite (Authoritativeness):**
   - "Bodrum'un lider mühendislik firması" vurgusu
   - 500+ proje referansı
   - Çalıştığımız markalar (Aldea, Varmeks, LG, vb.)
   - Sektör liderliği vurgusu

4. **Güvenilirlik (Trustworthiness):**
   - İletişim bilgileri (Telefon, adres)
   - Garanti ve servis vurgusu
   - "7/24 teknik destek" gibi güven unsurları
   - Müşteri memnuniyeti garantisi

**ÖNEMLİ KURALLAR:**
- Orijinal içeriğin ana mesajını koru
- SEO başlığını ve anahtar kelimeleri koru
- Minimum 1000 kelime olmalı
- Paragraflar arasında mantıklı geçişler
- Markdown formatını koru
- ASLA başka firma ismi belirtme
- ASLA dış link verme

Optimized içeriği tam olarak döndür:`;

      try {
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "Sen E-E-A-T optimizasyon uzmanısın. İçerikleri Google'ın kalite kriterlerine göre iyileştiriyorsun."
            },
            {
              role: "user",
              content: optimizationPrompt
            }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.4,
          max_tokens: 3500
        });
        
        const newContent = completion.choices[0]?.message?.content;
        
        if (!newContent) {
          throw new Error("Failed to generate optimized content");
        }
        
        return newContent;
      } catch (error) {
        console.error("Error generating optimized content:", error);
        throw error;
      }
    });
    
    // Step 4: Update content in database
    const updateResult = await step.run("update-content-in-database", async () => {
      try {
        const result = await sql`
          UPDATE generated_content
          SET 
            content = ${optimizedContent},
            metadata = jsonb_set(
              jsonb_set(
                jsonb_set(
                  COALESCE(metadata, '{}'),
                  '{eeatOptimized}',
                  'true'::jsonb
                ),
                '{eeatOptimizationDate}',
                ${JSON.stringify(new Date().toISOString())}::jsonb
              ),
              '{originalContent}',
              ${JSON.stringify({
                content: content.content.substring(0, 1000), // Store first 1000 chars as backup
                savedAt: new Date().toISOString()
              })}::jsonb
            ),
            updated_at = NOW()
          WHERE id = ${contentId}
          RETURNING id, slug, updated_at
        `;
        
        console.log(`Content ${contentId} successfully optimized and updated`);
        return result[0];
      } catch (error) {
        console.error("Error updating content:", error);
        throw error;
      }
    });
    
    // Step 5: Re-analyze E-E-A-T score after optimization
    const newAnalysis = await step.run("reanalyze-eeat-score", async () => {
      const { analyzeEEAT } = await import("../eeat-optimizer");
      
      try {
        const analysis = await analyzeEEAT(optimizedContent, content.topic, {
          createdAt: content.created_at,
          optimized: true
        });
        
        // Save new analysis
        await sql`
          UPDATE generated_content
          SET metadata = jsonb_set(
            COALESCE(metadata, '{}'),
            '{eeatAnalysisPostOptimization}',
            ${JSON.stringify(analysis)}::jsonb
          )
          WHERE id = ${contentId}
        `;
        
        console.log(`New E-E-A-T Score: ${analysis.overallScore}/100 (was ${eeatAnalysis?.overallScore || 0})`);
        return analysis;
      } catch (error) {
        console.error("Error re-analyzing E-E-A-T:", error);
        return null;
      }
    });
    
    // Step 6: Generate image prompt and trigger image generation (ALWAYS, regardless of score)
    await step.run("generate-image-prompt-and-trigger", async () => {
      const finalScore = newAnalysis?.overallScore || eeatAnalysis?.overallScore || 0;
      
      // ALWAYS generate prompt and image, regardless of E-E-A-T score
      console.log(`E-E-A-T score: ${finalScore}, generating image prompt and image...`);
      
      // Skip XAI prompt generation - generateImageForBlog creates its own prompt
      // Don't wait - let the processes run asynchronously

      // Trigger blog image generation directly with Vertex AI
      await inngest.send({
        name: "blog/image.generate.requested",
        data: {
          blogId: contentId,
          prompt: "", // Will be generated by XAI
          model: "vertex-ai/imagen-3.0", // Using Vertex AI Imagen 3.0
          aspectRatio: "16:9",
          sampleImageSize: "2k"
        }
      });
      
      console.log(`Image generation triggered for content ${contentId} (Score: ${finalScore})`);
      
      return { 
        imageGenerationTriggered: true,
        eeatScore: finalScore
      };
    });
    
    // Step 7: Trigger Facebook post (async, no waiting)
    await step.run("trigger-facebook-post", async () => {
      const finalScore = newAnalysis?.overallScore || eeatAnalysis?.overallScore || 0;

      // ALWAYS post to Facebook after optimization and image generation
      console.log(`Triggering Facebook post for content ${contentId} (Score: ${finalScore})...`);

      // Don't wait - the Facebook handler will manage timing
      await inngest.send({
        name: "social/facebook.post",
        data: {
          contentId: contentId,
          immediate: false // Let the handler manage timing
        }
      });

      return {
        facebookPostTriggered: true,
        eeatScore: finalScore
      };
    });
    
    // Step 8: Log the optimization
    await step.run("log-optimization", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'content.eeat.optimized',
          'optimization',
          'completed',
          ${JSON.stringify({
            contentId: contentId,
            topic: content.topic,
            slug: content.slug
          })},
          ${JSON.stringify({
            originalScore: eeatAnalysis?.overallScore || 0,
            newScore: newAnalysis?.overallScore || 0,
            improvement: (newAnalysis?.overallScore || 0) - (eeatAnalysis?.overallScore || 0),
            optimizedAt: new Date().toISOString()
          })}
        )
      `;
    });
    
    return {
      success: true,
      contentId: contentId,
      slug: content.slug,
      optimizationApplied: true,
      scores: {
        original: eeatAnalysis?.overallScore || 0,
        new: newAnalysis?.overallScore || 0,
        improvement: (newAnalysis?.overallScore || 0) - (eeatAnalysis?.overallScore || 0)
      },
      updatedAt: updateResult.updated_at
    };
  }
);

// Post optimized content to Facebook
export const postToFacebook = inngest.createFunction(
  {
    id: "post-to-facebook",
    name: "Post Content to Facebook Page",
    retries: 2
  },
  {
    event: "social/facebook.post"
  },
  async ({ event, step }) => {
    const { contentId, immediate = false } = event.data;
    
    // Step 1: Wait for image to be ready and fetch content
    const content = await step.run("wait-and-fetch-content-with-image", async () => {
      let attempts = 0;
      const maxAttempts = 10; // Try for up to 5 minutes (30s * 10)
      
      while (attempts < maxAttempts) {
        const result = await sql`
          SELECT 
            id,
            topic,
            title,
            content,
            slug,
            meta_title,
            meta_description,
            keywords,
            status,
            image_url,
            image_prompt
          FROM generated_content
          WHERE id = ${contentId}
            AND status = 'published'
          LIMIT 1
        `;
        
        if (result.length === 0) {
          throw new Error(`Published content not found with ID: ${contentId}`);
        }
        
        const content = result[0];
        
        // Check if image is ready
        if (content.image_url && content.image_url !== '') {
          console.log(`Image ready for content ${contentId}: ${content.image_url}`);
          return content;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`Waiting for image... Attempt ${attempts}/${maxAttempts}`);
          // Wait 30 seconds before next check
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      }
      
      // If we reach here, image is still not ready after max attempts
      console.warn(`Image not ready after ${maxAttempts} attempts for content ${contentId}, proceeding without image`);
      const finalResult = await sql`
        SELECT * FROM generated_content WHERE id = ${contentId} AND status = 'published' LIMIT 1
      `;
      return finalResult[0];
    });
    
    // Step 2: Check if already posted to Facebook
    const existingPost = await step.run("check-existing-facebook-post", async () => {
      const result = await sql`
        SELECT id, post_id, status
        FROM social_media_posts
        WHERE content_id = ${contentId}
          AND platform = 'facebook'
          AND status IN ('published', 'scheduled')
        LIMIT 1
      `;
      
      if (result.length > 0) {
        console.log(`Content ${contentId} already posted to Facebook`);
        return result[0];
      }
      
      return null;
    });
    
    if (existingPost) {
      return {
        success: true,
        message: "Content already posted to Facebook",
        postId: existingPost.post_id,
        status: existingPost.status
      };
    }
    
    // Step 3: Get Facebook credentials
    const credentials = await step.run("get-facebook-credentials", async () => {
      const creds = await getFacebookPageAccessToken();
      
      if (!creds) {
        throw new Error("Facebook credentials not available");
      }
      
      return creds;
    });
    
    // Step 4: Extract and prepare post data
    const postData = await step.run("prepare-facebook-post-data", async () => {
      // Extract Open Graph data
      const ogData = extractOGData({
        title: content.meta_title || content.title,
        meta_description: content.meta_description,
        slug: content.slug,
        keywords: content.keywords,
        image_url: content.image_url
      });
      
      // Facebook will automatically scrape the og:image from the blog post URL
      // We cannot specify picture parameter for external links due to Facebook security
      console.log(`Preparing Facebook post for: ${content.title}`);
      console.log(`Link: ${ogData.link}`);
      console.log(`Image will be scraped from og:image tag`);

      return ogData;
    });
    
    // Step 5: Post to Facebook
    const facebookResponse = await step.run("send-facebook-post", async () => {
      try {
        // If immediate post or scheduled for now
        if (immediate) {
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
        } else {
          // Schedule for optimal time (e.g., 2 PM local time next day)
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(14, 0, 0, 0); // 2 PM
          
          // For now, just post immediately
          // In production, you'd implement scheduling logic
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
        }
      } catch (error) {
        console.error("Error posting to Facebook:", error);
        
        // Save failed attempt
        await saveFacebookPost(
          contentId,
          "failed",
          postData,
          "failed"
        );
        
        throw error;
      }
    });
    
    // Step 6: Save post data to database
    await step.run("save-facebook-post-data", async () => {
      await saveFacebookPost(
        contentId,
        facebookResponse.postId,
        postData,
        facebookResponse.status
      );
      
      // Update content metadata with Facebook post info
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
        WHERE id = ${contentId}
      `;
    });
    
    // Step 7: Log the operation
    await step.run("log-facebook-post", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'social.facebook.posted',
          'social_media',
          'completed',
          ${JSON.stringify({
            contentId: contentId,
            postId: facebookResponse.postId,
            title: content.title
          })},
          ${JSON.stringify({
            platform: 'facebook',
            link: postData.link,
            postedAt: new Date().toISOString(),
            contentId: contentId
          })}
        )
      `;
    });

    // Step 8: Trigger Twitter post after successful Facebook post
    await step.run("trigger-twitter-post", async () => {
      // Check if Twitter is enabled
      const twitterEnabled = process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN;

      if (twitterEnabled) {
        console.log(`Triggering Twitter post for content ${contentId}`);

        // Send event to share on Twitter
        await inngest.send({
          name: "blog/twitter.share.requested",
          data: {
            blogId: contentId,
            fromFacebook: true
          }
        });

        console.log(`Twitter share event triggered for content ${contentId}`);
      } else {
        console.log("Twitter integration not configured, skipping Twitter post");
      }
    });
    
    return {
      success: true,
      contentId: contentId,
      postId: facebookResponse.postId,
      status: facebookResponse.status,
      link: postData.link,
      postedAt: new Date().toISOString()
    };
  }
);

// Check and refresh Facebook token
export const checkAndRefreshFacebookToken = inngest.createFunction(
  {
    id: "check-refresh-facebook-token",
    name: "Check and Refresh Facebook Token",
    retries: 2
  },
  {
    // Run daily at 3 AM
    cron: "0 3 * * *"
  },
  async ({ step }) => {
    const { 
      checkTokenNeedsRefresh, 
      getTokenExpiryInfo,
      exchangeForLongLivedToken,
      saveFacebookToken,
      logTokenRefresh,
      getActiveFacebookToken
    } = await import("../token-manager");
    
    // Step 1: Check if token needs refresh
    const needsRefresh = await step.run("check-token-needs-refresh", async () => {
      const needs = await checkTokenNeedsRefresh();
      const expiryInfo = await getTokenExpiryInfo();
      
      console.log("Token expiry check:", {
        needsRefresh: needs,
        expiryInfo: expiryInfo
      });
      
      return { needsRefresh: needs, expiryInfo };
    });
    
    if (!needsRefresh.needsRefresh) {
      return {
        success: true,
        message: "Token does not need refresh",
        daysRemaining: needsRefresh.expiryInfo?.days_remaining
      };
    }
    
    // Step 2: Get current token
    const currentToken = await step.run("get-current-token", async () => {
      return await getActiveFacebookToken();
    });
    
    if (!currentToken) {
      console.error("No active Facebook token found");
      await logTokenRefresh(
        "facebook",
        null,
        "failed",
        null,
        null,
        "No active token found"
      );
      
      return {
        success: false,
        error: "No active Facebook token found"
      };
    }
    
    // Step 3: Exchange for long-lived token
    const newToken = await step.run("exchange-for-long-lived-token", async () => {
      // First, check if the current token is still valid
      const debugUrl = `https://graph.facebook.com/v23.0/debug_token?` +
        `input_token=${currentToken.access_token}&` +
        `access_token=${currentToken.access_token}`;
      
      const debugResponse = await fetch(debugUrl);
      const debugData = await debugResponse.json();
      
      if (!debugData.data?.is_valid) {
        throw new Error("Current token is invalid, manual refresh required");
      }
      
      // Exchange for long-lived token
      const result = await exchangeForLongLivedToken(currentToken.access_token);
      
      if (!result) {
        throw new Error("Failed to exchange token");
      }
      
      return result;
    });
    
    // Step 4: Save new token
    const saveResult = await step.run("save-new-token", async () => {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + newToken.expires_in);
      
      const saved = await saveFacebookToken(
        newToken.access_token,
        currentToken.page_id,
        currentToken.page_name,
        expiresAt
      );
      
      // Log the refresh
      await logTokenRefresh(
        "facebook",
        null,
        saved ? "success" : "failed",
        new Date(currentToken.expires_at),
        expiresAt,
        saved ? undefined : "Failed to save token"
      );
      
      return {
        saved,
        newExpiresAt: expiresAt
      };
    });
    
    // Step 5: Send notification
    await step.run("send-notification", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'facebook.token.refreshed',
          'maintenance',
          'completed',
          ${JSON.stringify({
            oldExpiresAt: currentToken.expires_at,
            newExpiresAt: saveResult.newExpiresAt,
            daysExtended: 60
          })},
          ${JSON.stringify({
            refreshedAt: new Date().toISOString(),
            success: saveResult.saved
          })}
        )
      `;
    });
    
    return {
      success: true,
      message: "Facebook token refreshed successfully",
      newExpiresAt: saveResult.newExpiresAt,
      daysExtended: 60
    };
  }
);

// Monitor token expiry and send alerts
export const monitorTokenExpiry = inngest.createFunction(
  {
    id: "monitor-token-expiry",
    name: "Monitor Token Expiry",
    retries: 1
  },
  {
    // Run twice daily
    cron: "0 9,21 * * *"
  },
  async ({ step }) => {
    const { getTokenExpiryInfo } = await import("../token-manager");
    
    // Check token expiry
    const expiryInfo = await step.run("check-expiry", async () => {
      return await getTokenExpiryInfo();
    });
    
    if (!expiryInfo) {
      // Send alert - no token found
      await step.run("alert-no-token", async () => {
        console.error("ALERT: No Facebook token found in database");
        
        await sql`
          INSERT INTO event_logs (
            event_name,
            event_type,
            status,
            payload,
            metadata
          ) VALUES (
            'facebook.token.missing',
            'alert',
            'critical',
            ${JSON.stringify({
              message: "No Facebook token found",
              action_required: "Manual token setup required"
            })},
            ${JSON.stringify({
              alertedAt: new Date().toISOString(),
              severity: 'critical'
            })}
          )
        `;
      });
      
      return {
        success: false,
        alert: "No Facebook token found"
      };
    }
    
    // Check if token is expiring soon
    if (expiryInfo.days_remaining <= 3) {
      await step.run("alert-expiring-soon", async () => {
        console.warn(`ALERT: Facebook token expiring in ${expiryInfo.days_remaining} days`);
        
        // Trigger immediate refresh
        await inngest.send({
          name: "facebook/token.refresh",
          data: {
            urgent: true,
            daysRemaining: expiryInfo.days_remaining
          }
        });
        
        await sql`
          INSERT INTO event_logs (
            event_name,
            event_type,
            status,
            payload,
            metadata
          ) VALUES (
            'facebook.token.expiring',
            'alert',
            'warning',
            ${JSON.stringify({
              daysRemaining: expiryInfo.days_remaining,
              expiresAt: expiryInfo.expires_at,
              action: "Triggered automatic refresh"
            })},
            ${JSON.stringify({
              alertedAt: new Date().toISOString(),
              severity: 'warning'
            })}
          )
        `;
      });
    }
    
    return {
      success: true,
      platform: expiryInfo.platform,
      expiresAt: expiryInfo.expires_at,
      daysRemaining: expiryInfo.days_remaining,
      needsRefresh: expiryInfo.needs_refresh
    };
  }
);



// Import Cloudinary functions
import {
  cloudinaryUpload,
  cloudinaryTransform,
  cloudinaryDelete,
  cloudinaryOptimizeExisting,
  cloudinaryAutoTag
} from "./cloudinary-functions";

// Airtable sync functions removed - no longer in use

// Import image generation functions
import {
  generateImage,
  generateBulkImages
} from "./image-generation";

// Import Vertex AI image generation functions (replaced Fal.ai)
// Note: All Fal.ai functions have been replaced with Vertex AI
// generateImageForBlog now uses Vertex AI Imagen 3.0 despite being in fal-ai-generation.ts

// Import Fal.ai generation function (actually uses Vertex AI internally)
import { generateImageForBlog } from "./fal-ai-generation";

// Import Vertex AI image generation functions
import {
  handleVertexAIGeneration,
  generateBlogImageWithVertexAI
  // generateVertexImagesHourly - REMOVED: Vertex AI access no longer available
} from "./vertex-ai-generation";

// Twitter functions now imported from twitter-functions.ts instead
// (twitter-integration.ts disabled to prevent duplicate tweets)

// Export Markalar, Hizmetler and Urunler sync functions
export {
  cloudinaryUpload,
  cloudinaryTransform,
  cloudinaryDelete,
  cloudinaryOptimizeExisting,
  cloudinaryAutoTag,
  generateImage,
  generateBulkImages,
  // XAI functions
  generateContentWithXAI,
  generateImageWithXAI,
  enhanceContentWithXAI,
  generatePromptForContent,
  // Vertex AI functions
  handleVertexAIGeneration,
  generateBlogImageWithVertexAI,
  // generateVertexImagesHourly - REMOVED: Vertex AI access no longer available
  // Fal.ai generation (uses Vertex AI internally)
  generateImageForBlog
  // Twitter functions moved to twitter-functions.ts
};