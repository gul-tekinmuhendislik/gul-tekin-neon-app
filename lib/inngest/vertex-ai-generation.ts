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

      // Create a context-aware prompt based on the blog topic
      const topicPrompts: Record<string, string> = {
        "Isı Pompası": "modern heat pump system installation in luxury Bodrum villa, professional HVAC equipment, energy efficient heating cooling technology",
        "Güneş Enerjisi": "solar panel installation on Mediterranean rooftop, photovoltaic system in Bodrum, sustainable energy solution",
        "Klima Sistemleri": "modern VRF air conditioning system, multi-split climate control installation, professional HVAC technology",
        "Su Arıtma": "advanced water treatment facility, reverse osmosis purification system, industrial water filtration technology",
        "Havuz Sistemleri": "luxury swimming pool with advanced filtration, modern pool equipment room, professional pool maintenance systems",
        "Mekanik Tesisat": "professional mechanical installation, industrial piping systems, HVAC mechanical room equipment"
      };

      let basePrompt = topicPrompts[blogData.topic] ||
        "professional engineering equipment installation, modern industrial technology, Bodrum Turkey";

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

      // Add professional photography style
      basePrompt += ", professional architectural photography, bright daylight, clean modern design, ultra high resolution 4K, sharp details, no people, no text, no logos";

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

      // Generate dynamic prompt based on service - Bodrum/Muğla region specific
      const promptVariations = [
        `Abstract geometric illustration of ${selectedService.hizmet_adi} concept, minimalist Bodrum architecture elements, flowing shapes, gradient Mediterranean blues and whites, artistic interpretation, stylized composition`,
        `Artistic representation of ${selectedService.hizmet_adi} technology, abstract Muğla patterns, warm color palette, conceptual design elements, modern art style, creative visualization`,
        `Contemporary abstract illustration showing ${selectedService.hizmet_adi} essence, simplified Milas architectural forms, pastel colors, geometric patterns, artistic interpretation, design-focused`,
        `Stylized conceptual art of ${selectedService.hizmet_adi} innovation, abstract Yatağan landscape elements, flowing organic shapes, harmonious color composition, illustrative style`
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

      // Add consistent style modifiers for more artistic output
      const finalPrompt = `${basePrompt}, abstract illustration, conceptual art, minimalist design, vector art style, flat design elements, creative composition, modern graphic design, 4K resolution 1920x1080 minimum, no photorealism, no text, no logos, artistic interpretation, stylized and simplified forms, vibrant color gradients, tagged: ${selectedService.slug}`;

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