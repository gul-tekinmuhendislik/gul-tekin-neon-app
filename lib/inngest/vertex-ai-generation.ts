import { inngest } from "./client";
import { sql } from "../db";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Handle Vertex AI image generation requests
export const handleVertexAIGeneration = inngest.createFunction(
  {
    id: "handle-vertex-ai-generation",
    name: "Handle Vertex AI Image Generation",
    retries: 2
  },
  { event: "image/vertex-ai.generate.requested" },
  async ({ event, step }) => {
    const {
      prompt,
      contentId,
      aspectRatio = "16:9",
      numberOfImages = 1,
      language = "en",
      safetySetting = "block_some",
      personGeneration = "dont_allow",
      addWatermark = false,
      metadata = {}
    } = event.data;

    // Step 1: Generate image with Vertex AI
    const generationResult = await step.run("generate-with-vertex-ai", async () => {
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

      // Use high-quality model for content images
      const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-002`;

      const instances = [
        helpers.toValue({
          prompt: prompt,
        })
      ];

      const parameters = helpers.toValue({
        sampleCount: numberOfImages,
        aspectRatio: aspectRatio,
        sampleImageSize: "2k",
        safetySetting: safetySetting,
        personGeneration: personGeneration,
        includeRaiReason: true,
        includeSafetyAttributes: true,
        addWatermark: addWatermark,
        language: language
      });

      const request = {
        endpoint,
        instances: instances,
        parameters,
      };

      console.log(`Generating image with Vertex AI for content ID: ${contentId}`);
      const [response] = await predictionServiceClient.predict(request as any);

      if (!response || !response.predictions || response.predictions.length === 0) {
        throw new Error('No predictions returned from Vertex AI');
      }

      const prediction = response.predictions[0];
      const structValue = prediction.structValue;
      const fields = structValue?.fields;

      if (!fields?.bytesBase64Encoded) {
        throw new Error('No image data in Vertex AI response');
      }

      const imageBase64 = fields.bytesBase64Encoded.stringValue;

      return {
        imageBase64,
        prompt
      };
    });

    // Step 2: Upload to Cloudinary
    const cloudinaryResult = await step.run("upload-to-cloudinary", async () => {
      const dataUrl = `data:image/png;base64,${generationResult.imageBase64}`;

      const uploadResult = await cloudinary.uploader.upload(dataUrl, {
        folder: contentId ? 'vertex-ai-blog' : 'vertex-ai-generated',
        public_id: `vertex-ai-${contentId || Date.now()}`,
        tags: ['vertex-ai', 'ai-generated', contentId ? 'blog-image' : 'general'],
        context: {
          prompt: prompt.slice(0, 200),
          generated_at: new Date().toISOString(),
          model: 'imagen-3.0-generate-002',
          content_id: contentId || '',
          ...metadata
        }
      });

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    });

    // Step 3: Update content if contentId provided (for blog posts)
    if (contentId) {
      await step.run("update-content-with-image", async () => {
        await sql`
          UPDATE generated_content
          SET
            image_url = ${cloudinaryResult.url},
            image_prompt = ${prompt},
            updated_at = ${new Date().toISOString()}
          WHERE id = ${contentId}
        `;
      });
    }

    // Step 4: Save to vertex_images table
    await step.run("save-to-vertex-images", async () => {
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
          ${cloudinaryResult.url},
          ${cloudinaryResult.publicId},
          'imagen-3.0-generate-002',
          'vertex-ai',
          ${aspectRatio},
          ${JSON.stringify({
            contentId: contentId || null,
            ...metadata,
            generatedAt: new Date().toISOString()
          })},
          'completed'
        )
      `;
    });

    // Step 5: Log event
    await step.run("log-event", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'vertex-ai.image.generated',
          'image_generation',
          'success',
          ${JSON.stringify({
            contentId: contentId,
            prompt: prompt.substring(0, 500),
            imageUrl: cloudinaryResult.url
          })},
          ${JSON.stringify({
            model: 'imagen-3.0-generate-002',
            aspectRatio: aspectRatio,
            cloudinaryPublicId: cloudinaryResult.publicId
          })}
        )
      `;
    });

    return {
      success: true,
      imageUrl: cloudinaryResult.url,
      cloudinaryPublicId: cloudinaryResult.publicId,
      contentId: contentId,
      prompt: prompt,
      message: `Successfully generated and uploaded image to Cloudinary`
    };
  }
);

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
    interface BlogData {
      id: number;
      title: string;
      topic: string;
      keywords: string[];
      content: string;
      image_prompt: string | null;
      image_url: string | null;
      skipGeneration?: boolean;
    }

    const blogData = await step.run("fetch-blog-and-prompt", async (): Promise<BlogData> => {
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

      const blog = result[0] as BlogData;

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
          const systemPrompt = `You are an expert at creating prompts for Vertex AI Imagen following Google's best practices.
Your task is to create prompts for engineering service illustrations.

PROMPT STRUCTURE (in order):
1. Subject: Engineering service visualization
2. Style: Digital art, illustration, vector art, flat design
3. Environment: Mediterranean setting, minimal background
4. Lighting: Bright, natural daylight
5. Color: Vibrant Mediterranean palette - turquoise blue, terracotta orange, olive green, purple
6. Mood: Professional, modern, optimistic
7. Composition: Centered, balanced, clean

REQUIREMENTS:
- Use "digital art" or "illustration" style keywords
- Include specific color names (not just "colorful")
- Specify lighting conditions
- Keep prompts concise but descriptive
- Focus on visual elements, not concepts

AVOID:
- "Photorealistic", "photo", "realistic" keywords
- People, faces, text, logos
- Dark or industrial themes
- Complex technical jargon
- Abstract conceptual descriptions`;

          const userPrompt = `Create a Vertex AI Imagen prompt for this service:
Service: ${selectedService.hizmet_adi}
Description: ${selectedService.aciklama || 'Professional engineering service'}

Follow this structure:
[Subject] [Style] [Environment] [Lighting] [Color] [Mood] [Composition]

Example: "Solar panels on rooftop, digital art illustration, Mediterranean villa setting, bright daylight, turquoise blue and terracotta orange colors, optimistic mood, centered composition"

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

        // Generate service-specific digital illustration elements
        let specificElements = `Digital illustration of ${selectedService.hizmet_adi.toLowerCase()}`;

        // Dynamic keyword detection based on service description
        const keywords = description.split(/[\s,.-]+/).filter((word: string) => word.length > 2);

        // Build prompt elements based on actual service keywords - digital art style
        if (keywords.some((word: string) => ['güneş', 'solar', 'photovoltaic', 'panel'].includes(word))) {
          specificElements += ', stylized sun rays, warm yellow and orange gradients, solar panel vector graphics';
        } else if (keywords.some((word: string) => ['ısı', 'heat', 'pump', 'pompa', 'ısıtma'].includes(word))) {
          specificElements += ', warm color waves, heat flow illustration, stylized thermal graphics';
        } else if (keywords.some((word: string) => ['klima', 'soğutma', 'havalandırma', 'conditioning'].includes(word))) {
          specificElements += ', cool blue airflow illustration, minimalist cooling waves, fresh air vectors';
        } else if (keywords.some((word: string) => ['su', 'water', 'arıtma', 'filtrasyon', 'purification'].includes(word))) {
          specificElements += ', stylized water drops, clean blue gradients, filter layer illustration';
        } else if (keywords.some((word: string) => ['neon', 'tabela', 'aydınlatma', 'sign', 'lighting'].includes(word))) {
          specificElements += ', glowing neon effects, bright color illustrations, light beam vectors';
        } else if (keywords.some((word: string) => ['baca', 'chimney', 'duman', 'smoke', 'exhaust'].includes(word))) {
          specificElements += ', stylized smoke patterns, chimney silhouettes, airflow illustrations';
        } else {
          // Use generic digital art elements
          specificElements += ', modern digital art elements, colorful vector graphics';
        }

        // Create Google-optimized prompt structure: Subject, Style, Environment, Lighting, Color, Mood, Composition
        finalPrompt = `${specificElements}, digital art illustration style, Mediterranean minimalist background, bright natural daylight, turquoise blue and terracotta orange and olive green colors, professional optimistic mood, centered balanced composition, flat design vector art`;

        console.log(`Generated fallback prompt for service: ${selectedService.hizmet_adi} (index: ${serviceIndex})`);
      }

      // Add aspect ratio only (resolution is handled by sampleImageSize parameter)
      finalPrompt += `, 16:9 aspect ratio`;

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
          sampleImageSize: "1k", // Using 1k for fast model
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