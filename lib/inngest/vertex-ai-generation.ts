import { inngest } from "./client";
import { sql } from "../db";

// [REMOVED] generateImageWithVertexAI function has been removed
// Use generateBlogImageWithVertexAI or generateVertexImagesHourly instead

// [REMOVED] generateBulkImagesWithVertexAI function has been removed
// Use generateVertexImagesHourly for automated bulk generation

// Generate image for blog post with automatic prompt generation
export const generateBlogImageWithVertexAI = inngest.createFunction(
  {
    id: "generate-blog-image-vertex-ai",
    name: "Generate Blog Image with Vertex AI",
    retries: 2
  },
  {
    event: "blog/vertex-ai.image.generate.requested"
  },
  async ({ event, step }) => {
    const {
      blogId,
      prompt: providedPrompt,
      aspectRatio = "16:9", // Default to landscape for blog
      ...otherOptions
    } = event.data;

    // Step 1: Get blog content and prompt
    const blogData = await step.run("fetch-blog-and-prompt", async () => {
      const result = await sql`
        SELECT
          id,
          title,
          topic,
          keywords,
          content,
          image_prompt,
          image_url
        FROM generated_content
        WHERE id = ${blogId}
        LIMIT 1
      `;

      if (result.length === 0) {
        throw new Error(`Blog post not found with ID: ${blogId}`);
      }

      const blog = result[0];

      // Check if image already exists
      if (blog.image_url && !event.data.forceRegenerate) {
        console.log(`Blog ${blogId} already has an image: ${blog.image_url}`);
        return {
          ...blog,
          skipGeneration: true
        };
      }

      return blog;
    });

    // Skip if image already exists
    if (blogData.skipGeneration) {
      return {
        success: true,
        message: "Blog already has an image",
        existingImageUrl: blogData.image_url
      };
    }

    // Step 2: Determine or generate prompt
    const finalPrompt = await step.run("determine-prompt", async () => {
      // Priority: provided prompt > existing image_prompt > generate new
      if (providedPrompt) {
        console.log(`Using provided prompt for blog ${blogId}`);
        return providedPrompt;
      }

      if (blogData.image_prompt) {
        console.log(`Using existing image prompt for blog ${blogId}`);
        return blogData.image_prompt;
      }

      // Generate prompt based on blog content
      console.log(`Generating new prompt for blog ${blogId}`);

      // Create a context-aware prompt based on the blog topic - Mediterranean Turkish architecture
      const topicPrompts: Record<string, string> = {
        "Isı Pompası": "heat pump system with Mediterranean Turkish villa, traditional Muğla red clay roof tiles, stone chimneys, olive grove background, purple bougainvillea, technical illustration",
        "Güneş Enerjisi": "solar panels on traditional Turkish rooftop with red clay tiles, Bodrum white cubic architecture, olive trees, bougainvillea flowers, Aegean coastal view",
        "Klima Sistemleri": "VRF system on Mediterranean building with stone walls, Turkish clay roof tiles, olive groves, bougainvillea accents, professional engineering aesthetics",
        "Su Arıtma": "water treatment system with Turkish stone architecture, Mediterranean garden setting, traditional chimneys, olive trees, technical drawing style",
        "Havuz Sistemleri": "pool system with Bodrum white stone walls, Mediterranean tiles, bougainvillea cascading, olive landscape, engineering blueprint aesthetics",
        "Mekanik Tesisat": "mechanical systems with traditional Muğla architecture, red clay tiles, stone chimney details, Mediterranean flora, technical illustration"
      };

      let basePrompt = topicPrompts[blogData.topic] ||
        "engineering equipment with Mediterranean Turkish architecture, Muğla red clay roof tiles, stone chimneys, olive groves, purple bougainvillea, Bodrum Turkey";

      // Add title context if available
      if (blogData.title) {
        const titleKeywords = blogData.title
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(' ')
          .filter((word: string) => word.length > 4)
          .slice(0, 3)
          .join(' ');

        if (titleKeywords) {
          basePrompt = `${titleKeywords}, ${basePrompt}`;
        }
      }

      // Add Mediterranean Turkish architectural style elements with advanced parameters
      const advancedParams = ", photorealistic raw style, maximum quality 2, aspect ratio 16:9";
      const mediterraneanStyle = ", Mediterranean Turkish architecture style, traditional elements, natural lighting, clean professional photography, modern engineering aesthetics";
      const negativeElements = ", no modern city background, no concrete blocks, no industrial zones, no northern European architecture, no pine trees, no lavender fields, no overly saturated colors, no cartoon style, no artificial lighting, no people, no text, no watermarks, no logos";

      basePrompt += advancedParams + mediterraneanStyle + ", technical illustration approach, ultra high resolution 4K, sharp details" + negativeElements;

      return basePrompt;
    });

    // Step 3: Save prompt to blog if it was generated
    if (!providedPrompt && !blogData.image_prompt) {
      await step.run("save-generated-prompt", async () => {
        await sql`
          UPDATE generated_content
          SET image_prompt = ${finalPrompt}
          WHERE id = ${blogId}
        `;
        console.log(`Saved generated prompt for blog ${blogId}`);
      });
    }

    // Step 4: Trigger Vertex AI image generation
    const generationResult = await step.run("trigger-vertex-ai-generation", async () => {
      // Send the generation event
      await inngest.send({
        name: "image/vertex-ai.generate.requested",
        data: {
          prompt: finalPrompt,
          contentId: blogId,
          aspectRatio,
          numberOfImages: 1,
          language: "en",
          safetySetting: "block_some",
          personGeneration: "dont_allow",
          addWatermark: false,
          ...otherOptions
        }
      });

      return {
        prompt: finalPrompt,
        blogId
      };
    });

    return {
      success: true,
      message: `Vertex AI image generation triggered for blog ${blogId}`,
      blogId,
      prompt: generationResult.prompt,
      aspectRatio
    };
  }
);

// Test Vertex AI connection
// [REMOVED] testVertexAIConnection function has been removed
// Vertex AI connection is tested automatically in production functions

// Generate images with Vertex AI every 15 minutes
export const generateVertexImagesHourly = inngest.createFunction(
  {
    id: "generate-vertex-images-15min",
    name: "Generate Vertex AI Images Every 15 Minutes",
    retries: 2
  },
  [
    {
      // Run every 15 minutes (96 images/day)
      cron: "*/15 * * * *"
    },
    {
      // Manual trigger event
      event: "vertex-ai/15min.manual"
    }
  ],
  async ({ step }) => {
    // Step 1: Get services from database and determine next service
    const { service, prompt, slug, serviceIndex } = await step.run("determine-service-and-prompt", async () => {
      // Get all services from database
      const services = await sql`
        SELECT id, hizmet_adi, slug, aciklama
        FROM hizmetler
        ORDER BY id
      `;

      // Get the last generated image to determine next service
      const lastImage = await sql`
        SELECT metadata
        FROM vertex_images
        ORDER BY created_at DESC
        LIMIT 1
      `;

      let serviceIndex = 0;
      if (lastImage.length > 0 && lastImage[0].metadata?.serviceIndex !== undefined) {
        // Get next service in sequence
        serviceIndex = (lastImage[0].metadata.serviceIndex + 1) % services.length;
      }

      const selectedService = services[serviceIndex];

      // Generate dynamic prompt based on service - Mediterranean Turkish architecture specific
      const promptVariations = [
        `Abstract geometric illustration of ${selectedService.hizmet_adi} concept, Mediterranean Turkish architecture elements, traditional Muğla red clay roof tiles pattern, minimalist stone chimney shapes, olive grove textures, purple bougainvillea color accents, gradient Mediterranean blues and whites, technical illustration style`,
        `Artistic representation of ${selectedService.hizmet_adi} technology, traditional Bodrum white cubic houses abstracted, geometric stone wall patterns, turquoise Aegean sea colors, modern engineering aesthetics, clean professional design, natural lighting effects, creative visualization`,
        `Contemporary abstract illustration showing ${selectedService.hizmet_adi} essence, simplified Milas stone architecture forms, terracotta and earth tones from clay tiles, olive tree silhouettes, bougainvillea purple gradients, technical drawing elements, modern Turkish architectural style`,
        `Stylized conceptual art of ${selectedService.hizmet_adi} innovation, Yatağan pine forest abstract patterns, traditional stone chimney geometric shapes, Mediterranean roof tile textures, olive and bougainvillea natural elements, engineering blueprint aesthetics, professional technical illustration`
      ];

      // Use service description if available for more context
      const description = selectedService.aciklama || selectedService.hizmet_adi;

      // Select a prompt variation based on current time
      const now = new Date();
      const promptIndex = Math.floor(now.getMinutes() / 15) % promptVariations.length;
      let basePrompt = promptVariations[promptIndex];

      // Enhance prompt with description context
      if (selectedService.aciklama && selectedService.aciklama.length > 20) {
        // Extract key terms from Turkish description and create English prompt
        const enhancedContext = description.toLowerCase().includes('güneş') ? 'abstract solar energy concept' :
                               description.toLowerCase().includes('ısı pompa') ? 'stylized heat pump visualization' :
                               description.toLowerCase().includes('klima') ? 'artistic climate control representation' :
                               description.toLowerCase().includes('su arıt') ? 'abstract water flow patterns' :
                               description.toLowerCase().includes('havuz') ? 'geometric pool design elements' :
                               description.toLowerCase().includes('sulama') ? 'organic irrigation patterns' :
                               description.toLowerCase().includes('yangın') ? 'safety system iconography' :
                               description.toLowerCase().includes('otomasyon') ? 'smart technology symbols' :
                               'abstract engineering concepts';

        basePrompt = `${enhancedContext}, ${basePrompt}`;
      }

      // Add consistent Mediterranean Turkish architectural style modifiers with negative prompts
      const styleModifiers = "photorealistic raw style, maximum quality 2, aspect ratio 16:9, ultra detailed, professional photography";
      const positiveElements = "abstract Mediterranean Turkish architecture illustration, traditional Muğla elements, red clay roof tile patterns, stone chimney geometric forms, olive grove and bougainvillea accents, technical engineering drawing style, clean professional composition, natural Mediterranean lighting";
      const negativePrompts = "no modern city background, no concrete blocks, no industrial zones, no northern European architecture, no pine trees, no lavender fields, no overly saturated colors, no cartoon style, no artificial lighting, no text, no watermarks, no logos";

      const finalPrompt = `${basePrompt}, ${styleModifiers}, ${positiveElements}, 4K resolution 1920x1080 minimum, artistic technical interpretation, vibrant Turkish Mediterranean color palette, ${negativePrompts}, tagged: ${selectedService.slug}`;

      return {
        service: selectedService.hizmet_adi,
        prompt: finalPrompt,
        slug: selectedService.slug,
        serviceIndex: serviceIndex
      };
    });

    // Step 2: Check if similar image was generated recently
    await step.run("check-recent-generation", async () => {
      const fifteenMinutesAgo = new Date();
      fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

      const recent = await sql`
        SELECT id, prompt, created_at
        FROM vertex_images
        WHERE created_at > ${fifteenMinutesAgo}
          AND status = 'completed'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (recent.length > 0) {
        console.log(`Recent image found (${recent[0].id}), created at ${recent[0].created_at}`);
        // Still proceed but with a different prompt variation
      }

      return recent.length > 0;
    });

    // Step 3: Generate image with Vertex AI
    const generationResult = await step.run("trigger-vertex-generation", async () => {
      try {
        // Send generation event with service metadata
        await inngest.send({
          name: "image/vertex-ai.generate.requested",
          data: {
            prompt: prompt,
            aspectRatio: "16:9", // Landscape for web display
            numberOfImages: 1,
            language: "en",
            safetySetting: "block_some",
            personGeneration: "dont_allow",
            addWatermark: false,
            metadata: {
              service: service,
              slug: slug,
              serviceIndex: serviceIndex
            }
          }
        });

        return {
          success: true,
          prompt: prompt,
          service: service,
          slug: slug
        };
      } catch (error) {
        console.error("Error triggering Vertex AI generation:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    // Step 4: Log the generation
    await step.run("log-15min-generation", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'vertex-ai.15min.generation',
          'cron',
          ${generationResult.success ? 'completed' : 'failed'},
          ${JSON.stringify({
            service: service,
            slug: slug,
            prompt: prompt.substring(0, 500),
            hour: new Date().getHours(),
            serviceIndex: serviceIndex
          })},
          ${JSON.stringify({
            success: generationResult.success,
            error: 'error' in generationResult ? generationResult.error : undefined,
            timestamp: new Date().toISOString()
          })}
        )
      `;
    });

    // Step 5: Optional - Clean up old images (keep last 100)
    // DISABLED: Cleanup is commented out to preserve all historical images
    /*
    await step.run("cleanup-old-images", async () => {
      try {
        // Get images to delete (keep last 100)
        const oldImages = await sql`
          SELECT id, cloudinary_public_id
          FROM vertex_images
          WHERE id NOT IN (
            SELECT id FROM vertex_images
            ORDER BY created_at DESC
            LIMIT 100
          )
        `;

        if (oldImages.length > 0) {
          console.log(`Found ${oldImages.length} old images to clean up`);

          // Mark as deleted in database (don't actually delete from Cloudinary yet)
          await sql`
            UPDATE vertex_images
            SET status = 'archived'
            WHERE id IN (${oldImages.map(img => img.id)})
          `;
        }

        return oldImages.length;
      } catch (error) {
        console.error("Error during cleanup:", error);
        return 0;
      }
    });
    */

    return {
      success: generationResult.success,
      service: service,
      slug: slug,
      prompt: prompt,
      timestamp: new Date().toISOString(),
      message: generationResult.success
        ? `15-minute interval image generation triggered for ${service} (${slug})`
        : `Failed to generate image: ${'error' in generationResult ? generationResult.error : 'Unknown error'}`
    };
  }
);