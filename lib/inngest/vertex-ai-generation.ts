import { inngest } from "./client";
import { sql } from "../db";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

      // Generate dynamic prompt with XAI based on blog content
      console.log(`Generating dynamic prompt with XAI for blog ${blogId}`);

      const apiKey = process.env.XAI_API_KEY;
      if (apiKey) {
        try {
          const systemPrompt = `You are an expert at creating image generation prompts for Vertex AI Imagen.
Your task is to create detailed, photorealistic prompts for blog post hero images.

IMPORTANT STYLE ELEMENTS TO INCLUDE:
- Mediterranean Turkish architecture (Bodrum/Muğla region)
- Traditional Muğla red clay roof tiles
- Stone chimneys and white stone walls
- Olive groves and purple bougainvillea
- Natural Mediterranean lighting
- Professional architectural photography style
- Technical engineering aesthetics
- Photorealistic raw style, maximum quality

AVOID:
- Modern city backgrounds
- Concrete blocks or industrial zones
- Northern European architecture
- Pine trees or lavender fields
- Cartoon or illustration styles
- People, text, watermarks, logos
- Artificial lighting
- Overly saturated colors`;

          const userPrompt = `Create a detailed image generation prompt for this blog post:
Title: ${blogData.title}
Topic: ${blogData.topic}
Content Preview: ${blogData.content?.substring(0, 500) || ''}

Generate a single, detailed prompt that captures the essence of the content while incorporating Mediterranean Turkish architectural elements.
Focus on creating a photorealistic, professional photograph suitable for a blog hero image.
Return ONLY the prompt, no explanations.`;

          const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "grok-beta",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              temperature: 0.7,
              max_tokens: 300
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedPrompt = data.choices[0]?.message?.content?.trim();
            if (generatedPrompt) {
              console.log(`XAI generated prompt: ${generatedPrompt.substring(0, 100)}...`);
              return `${generatedPrompt}, aspect ratio 16:9, ultra high resolution 4K, sharp details`;
            }
          }
        } catch (error) {
          console.error("Error generating prompt with XAI:", error);
        }
      }

      // Fallback to static prompt if XAI fails
      console.log("XAI unavailable, using fallback prompt");
      return `Modern ${blogData.topic} installation in Mediterranean Turkish villa, Muğla red clay roof tiles, stone chimneys, olive groves, purple bougainvillea, professional architectural photography, natural lighting, photorealistic raw style, maximum quality 2, aspect ratio 16:9, ultra high resolution 4K, sharp details, no people, no text, no watermarks, no logos`;
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

// Generate images with Vertex AI every 10 minutes using fast model
export const generateVertexImagesHourly = inngest.createFunction(
  {
    id: "generate-vertex-images-10min",
    name: "Generate Vertex AI Images Every 10 Minutes (Fast Model)",
    retries: 2
  },
  [
    {
      // Run every 10 minutes (144 images/day) - using fast model for cost optimization
      cron: "*/10 * * * *"
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

      // Generate dynamic prompt with XAI based on service
      let finalPrompt = "";

      const apiKey = process.env.XAI_API_KEY;
      if (apiKey) {
        try {
          const systemPrompt = `You are an expert at creating abstract, artistic image generation prompts for Vertex AI Imagen.
Your task is to create prompts for engineering service visualizations.

STYLE REQUIREMENTS:
- Abstract geometric illustrations (NOT photorealistic)
- Technical engineering blueprint aesthetics
- Mediterranean Turkish architectural elements as abstract patterns
- Muğla red clay roof tile patterns (geometric, not literal)
- Stone chimney shapes (simplified, abstract)
- Olive grove textures and purple bougainvillea color gradients
- Clean, modern, professional technical illustration style

AVOID:
- Photorealistic images
- Actual buildings or real structures
- People, faces, human figures
- Text, logos, watermarks
- Modern city backgrounds
- Concrete blocks, industrial zones
- Northern European elements
- Pine trees, lavender fields`;

          const userPrompt = `Create an abstract, artistic visualization prompt for this engineering service:
Service Name: ${selectedService.hizmet_adi}
Description: ${selectedService.aciklama || 'Professional engineering service'}
Category: Technical/Engineering

Generate a single prompt that creates an abstract, geometric illustration representing this service.
Use Mediterranean Turkish design elements as abstract patterns and color schemes.
Return ONLY the prompt, no explanations.`;

          const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "grok-beta",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              temperature: 0.8,
              max_tokens: 250
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedPrompt = data.choices[0]?.message?.content?.trim();
            if (generatedPrompt) {
              console.log(`XAI generated prompt for ${selectedService.hizmet_adi}`);
              finalPrompt = generatedPrompt;
            }
          }
        } catch (error) {
          console.error("Error generating prompt with XAI:", error);
        }
      }

      // Fallback to static prompt if XAI fails or is not available
      if (!finalPrompt) {
        const description = (selectedService.aciklama || selectedService.hizmet_adi).toLowerCase();

        // Generate service-specific abstract elements based on actual service data
        let specificElements = `Abstract ${selectedService.hizmet_adi.toLowerCase()} visualization`;

        // Dynamic keyword detection based on service description
        const keywords = description.split(/[\s,.-]+/).filter((word: string) => word.length > 2);

        // Build prompt elements based on actual service keywords
        if (keywords.some((word: string) => ['güneş', 'solar', 'photovoltaic', 'panel'].includes(word))) {
          specificElements += ', solar energy patterns, geometric sun rays, golden gradient meshes';
        } else if (keywords.some((word: string) => ['ısı', 'heat', 'pump', 'pompa', 'ısıtma'].includes(word))) {
          specificElements += ', thermal gradient patterns, heat flow visualization, coil spirals';
        } else if (keywords.some((word: string) => ['klima', 'soğutma', 'havalandırma', 'conditioning'].includes(word))) {
          specificElements += ', air flow patterns, cooling abstractions, ventilation spirals';
        } else if (keywords.some((word: string) => ['su', 'water', 'arıtma', 'filtrasyon', 'purification'].includes(word))) {
          specificElements += ', water flow patterns, filtration membranes, crystal droplets';
        } else if (keywords.some((word: string) => ['neon', 'tabela', 'aydınlatma', 'sign', 'lighting'].includes(word))) {
          specificElements += ', geometric light patterns, illuminated elements, glowing circuits';
        } else if (keywords.some((word: string) => ['baca', 'chimney', 'duman', 'smoke', 'exhaust'].includes(word))) {
          specificElements += ', chimney geometry, airflow dynamics, ventilation abstractions';
        } else {
          // Use generic engineering elements with service-specific focus
          specificElements += ', technical engineering elements, geometric precision patterns';
        }

        // Create comprehensive prompt with service information
        finalPrompt = `${specificElements}, abstract geometric illustration representing ${selectedService.hizmet_adi} engineering service, Mediterranean Turkish design elements, Muğla tile patterns, olive branch geometry, purple and terracotta gradients, technical blueprint aesthetic, clean modern illustration, no photorealism, no text, no people, no blurry, no artifacts, no oversaturated, professional technical visualization`;

        console.log(`Generated fallback prompt for service: ${selectedService.hizmet_adi} (index: ${serviceIndex})`);
      }

      // Add final style modifiers
      finalPrompt += `, aspect ratio 16:9, 4K resolution 1920x1080 minimum, professional technical illustration, tagged: ${selectedService.slug}`;

      return {
        service: selectedService.hizmet_adi,
        prompt: finalPrompt,
        slug: selectedService.slug,
        serviceIndex: serviceIndex
      };
    });

    // Step 2: Check if similar image was generated recently
    await step.run("check-recent-generation", async () => {
      const tenMinutesAgo = new Date();
      tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

      const recent = await sql`
        SELECT id, prompt, created_at
        FROM vertex_images
        WHERE created_at > ${tenMinutesAgo}
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

    // Step 3: Generate image with Vertex AI using FAST model for cost optimization
    const generationResult = await step.run("generate-with-fast-vertex-ai", async () => {
      try {
        // Import Vertex AI modules
        const { PredictionServiceClient, helpers } = await import('@google-cloud/aiplatform');

        const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'gul-tekin-muhendislik';
        const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

        // Get credentials from environment
        let credentials: Record<string, unknown> | undefined = undefined;
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
          const credentialsJson = Buffer.from(
            process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
            'base64'
          ).toString('utf-8');
          credentials = JSON.parse(credentialsJson);
        }

        const predictionServiceClient = new PredictionServiceClient({
          apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
          credentials: credentials,
        });

        // Use FAST model for service images (cheaper, faster)
        const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-fast-generate-001`;

        const instances = [
          helpers.toValue({
            prompt: prompt,
          })
        ];

        const parameters = helpers.toValue({
          sampleCount: 1,
          aspectRatio: "16:9",
          sampleImageSize: "1024x1024", // Smaller size for fast model
          safetySetting: "block_some",
          personGeneration: "dont_allow",
          includeRaiReason: false,
          includeSafetyAttributes: false,
          language: "en"
        });

        // Type assertion needed due to Vertex AI SDK typing requirements
        const request = {
          endpoint,
          instances: instances as Parameters<typeof predictionServiceClient.predict>[0]['instances'],
          parameters,
        };

        console.log(`Generating service image with Vertex AI Fast Model for: ${service}`);
        const [response] = await predictionServiceClient.predict(request);

        if (!response || !response.predictions || response.predictions.length === 0) {
          throw new Error('No predictions returned from Vertex AI Fast Model');
        }

        const prediction = response.predictions[0];
        const structValue = prediction.structValue;
        const fields = structValue?.fields;

        if (!fields?.bytesBase64Encoded) {
          throw new Error('No image data in Vertex AI response');
        }

        const imageBase64 = fields.bytesBase64Encoded.stringValue;

        if (!imageBase64) {
          throw new Error('Image Base64 data is empty');
        }

        console.log(`Generated image size: ${Math.round(imageBase64.length * 0.75 / 1024)} KB`);

        // Upload to Cloudinary with error handling
        const { v2: cloudinary } = await import('cloudinary');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        console.log(`Uploading to Cloudinary for service: ${service}`);

        let uploadResult;
        try {
          uploadResult = await cloudinary.uploader.upload(
            `data:image/png;base64,${imageBase64}`,
            {
              folder: 'vertex-ai-services',
              public_id: `service-${slug}-${Date.now()}`,
              tags: ['vertex-ai', 'service-image', 'fast-model', slug],
              context: {
                prompt: prompt.slice(0, 200),
                service: service,
                model: 'imagen-3.0-fast-generate-001',
                generated_at: new Date().toISOString()
              }
            }
          );

          console.log(`Cloudinary upload successful: ${uploadResult.secure_url}`);
        } catch (cloudinaryError) {
          console.error(`Cloudinary upload failed for service ${service}:`, cloudinaryError);
          throw new Error(`Cloudinary upload failed: ${cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error'}`);
        }

        // Save to database
        await sql`
          INSERT INTO vertex_images (
            prompt,
            enhanced_prompt,
            image_url,
            cloudinary_public_id,
            model,
            provider,
            aspect_ratio,
            metadata,
            status
          ) VALUES (
            ${prompt},
            ${prompt},
            ${uploadResult.secure_url},
            ${uploadResult.public_id},
            'imagen-3.0-fast-generate-001',
            'vertex-ai',
            '16:9',
            ${JSON.stringify({
              service: service,
              slug: slug,
              serviceIndex: serviceIndex,
              cost: 0.022, // Fast model cost
              generatedAt: new Date().toISOString()
            })},
            'completed'
          )
        `;

        return {
          success: true,
          imageUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          prompt: prompt,
          service: service,
          slug: slug,
          model: 'imagen-3.0-fast-generate-001',
          cost: 0.022
        };
      } catch (error) {
        console.error("Error generating with Vertex AI Fast Model:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    // Step 4: Log the generation
    await step.run("log-10min-generation", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'vertex-ai.10min.generation',
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