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
        sampleImageSize: "1k",  // Reduced to prevent oversized outputs
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // Log image size for debugging
      const imageSizeKB = imageBase64 ? Math.round(imageBase64.length * 0.75 / 1024) : 0;
      console.log(`Generated image size: ${imageSizeKB} KB`);

      if (imageSizeKB > 5120) {
        console.warn(`Image size (${imageSizeKB} KB) exceeds 5MB, may cause rendering issues`);
      }

      return {
        imageBase64,
        prompt: prompt.substring(0, 1000)  // Increased limit for response
      };
    });

    // Step 2: Upload to Cloudinary using Buffer stream
    const cloudinaryResult = await step.run("upload-to-cloudinary", async () => {
      // Validate base64 data exists
      if (!generationResult.imageBase64) {
        throw new Error('No image data to upload');
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(generationResult.imageBase64, 'base64');

      // Upload using stream for better memory efficiency
      const uploadResult = await new Promise<{secure_url: string; public_id: string}>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: contentId ? 'vertex-ai-blog' : 'vertex-ai-generated',
            public_id: `vertex-ai-${contentId || Date.now()}`,
            resource_type: 'image',
            format: 'png',
            tags: ['vertex-ai', 'ai-generated', contentId ? 'blog-image' : 'general'],
            context: {
              prompt: prompt.slice(0, 200),
              generated_at: new Date().toISOString(),
              model: 'imagen-3.0-generate-002',
              content_id: contentId || '',
              ...metadata
            }
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else if (result) {
              resolve(result as {secure_url: string; public_id: string});
            } else {
              reject(new Error('Upload failed: no result'));
            }
          }
        );

        // Write buffer to stream
        uploadStream.end(imageBuffer);
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
            prompt: prompt.substring(0, 200),
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
      console.log(`XAI API Key status: ${apiKey ? 'Found' : 'NOT FOUND - will use fallback'}`);

      if (apiKey) {
        try {
          // Extract key technical terms from content
          const keywords = blogData.keywords || [];

          // Determine visual style based on topic and content
          const topicLower = blogData.topic.toLowerCase();
          let visualStyle = '';
          let colorPalette = '';
          let composition = '';
          let technicalElements = '';

          // Dynamic style selection based on content
          if (topicLower.includes('güneş') || topicLower.includes('solar')) {
            visualStyle = 'bright sunny day, golden hour lighting, solar panels gleaming';
            colorPalette = 'warm oranges, deep blues, metallic silver';
            composition = 'aerial drone view of rooftop installation';
            technicalElements = 'photovoltaic cells, inverters, mounting rails, electrical meters';
          } else if (topicLower.includes('ısı pompa') || topicLower.includes('heat pump')) {
            visualStyle = 'modern technical cutaway illustration, x-ray vision effect';
            colorPalette = 'cool blues transitioning to warm reds, thermal gradient';
            composition = 'split-screen showing indoor comfort and outdoor unit';
            technicalElements = 'compressor unit, refrigerant pipes, heat exchanger coils';
          } else if (topicLower.includes('klima') || topicLower.includes('air')) {
            visualStyle = 'clean minimalist interior, soft natural lighting';
            colorPalette = 'crisp whites, soft grays, accent of sky blue';
            composition = 'modern living room with sleek AC unit';
            technicalElements = 'air flow visualization, temperature zones, control panel';
          } else if (topicLower.includes('su arıtma') || topicLower.includes('water')) {
            visualStyle = 'crystal clear water, transparency effects, refraction';
            colorPalette = 'aqua blues, pure whites, stainless steel metallic';
            composition = 'cross-section view of filtration stages';
            technicalElements = 'filter chambers, RO membrane, UV sterilizer, flow indicators';
          } else {
            // Random variation for other topics
            const variations = [
              {
                visualStyle: 'industrial chic, dramatic lighting, high contrast',
                colorPalette: 'deep blacks, electric blues, copper accents',
                composition: 'dynamic diagonal composition, rule of thirds'
              },
              {
                visualStyle: 'futuristic tech lab, neon accents, glass and steel',
                colorPalette: 'cyberpunk purples, neon greens, chrome silver',
                composition: 'isometric 3D view, technical blueprint overlay'
              },
              {
                visualStyle: 'eco-friendly green tech, natural materials, organic shapes',
                colorPalette: 'forest greens, earth browns, sky blues',
                composition: 'harmonious blend of technology and nature'
              }
            ];
            const randomVar = variations[Math.floor(Math.random() * variations.length)];
            visualStyle = randomVar.visualStyle;
            colorPalette = randomVar.colorPalette;
            composition = randomVar.composition;
            technicalElements = 'precision engineering components, digital displays, sensor arrays';
          }

          // Add time-based variations
          const hour = new Date().getHours();
          const timeOfDay = hour < 12 ? 'morning light' : hour < 17 ? 'afternoon sun' : 'golden hour';

          // Add seasonal variations
          const month = new Date().getMonth();
          const season = month < 3 ? 'winter atmosphere' : month < 6 ? 'spring freshness' : month < 9 ? 'summer vibrancy' : 'autumn warmth';

          const systemPrompt = `You are an expert at creating diverse, creative image generation prompts for Vertex AI Imagen.
Your task is to create unique, varied prompts that avoid repetition while maintaining professional quality.

IMPORTANT GUIDELINES:
- Create COMPLETELY DIFFERENT visual styles for each prompt
- Vary between: photorealistic, technical illustration, architectural visualization, infographic style
- Mix different perspectives: aerial, close-up, wide angle, isometric, cross-section
- Use diverse color palettes and moods
- Include specific technical details relevant to the topic
- Incorporate dynamic elements and energy
- Be creative and avoid clichés

VISUAL STYLE CONTEXT:
- Suggested style: ${visualStyle}
- Color palette: ${colorPalette}
- Composition: ${composition}
- Time: ${timeOfDay}
- Season: ${season}
- Technical elements: ${technicalElements}

Mix and match these elements creatively. Don't use all of them - pick what works best.`;

          const userPrompt = `Create a unique, creative image generation prompt for this blog post:
Title: ${blogData.title}
Topic: ${blogData.topic}
Keywords: ${keywords.join(', ')}
Content Preview: ${blogData.content?.substring(0, 500) || ''}

Important: Make this prompt DIFFERENT from typical engineering visuals. Be creative!
Include specific technical details from the content.
Vary the style - don't always use photorealistic. Try technical illustrations, infographics, or artistic interpretations.
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
              temperature: 0.85,  // Increased for more creativity
              max_tokens: 300     // Increased for more detailed prompts
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedPrompt = data.choices[0]?.message?.content?.trim();
            if (generatedPrompt) {
              // Increased limit for better prompt quality (Vertex AI can handle up to 2048 chars)
              const limitedPrompt = generatedPrompt.substring(0, 800);
              console.log(`XAI generated prompt (limited to 800 chars): ${limitedPrompt.substring(0, 150)}...`);
              return `${limitedPrompt}, aspect ratio 16:9`;
            }
          }
        } catch (error) {
          console.error("Error generating prompt with XAI:", error);
          console.log("XAI error details:", error instanceof Error ? error.message : error);
        }
      } else {
        console.warn("⚠️ XAI_API_KEY not found in environment variables!");
        console.log("To enable XAI prompt generation, add XAI_API_KEY to your .env file");
      }

      // Enhanced dynamic fallback prompt if XAI fails
      console.log("Using enhanced dynamic fallback prompt (XAI unavailable)");

      // Create varied fallback prompts based on topic
      const topicLower = blogData.topic.toLowerCase();
      const randomSeed = Math.random();

      // Array of diverse visual styles
      const visualStyles = [
        'ultra-modern minimalist design, glass and steel architecture',
        'technical blueprint style illustration, CAD drawing aesthetic',
        'photorealistic industrial photography, dramatic lighting',
        'isometric 3D visualization, clean vector graphics',
        'futuristic sci-fi concept art, holographic displays',
        'elegant architectural visualization, sunset golden hour',
        'high-tech laboratory environment, clean room aesthetic',
        'eco-friendly green building, sustainable design'
      ];

      const selectedStyle = visualStyles[Math.floor(randomSeed * visualStyles.length)];

      // Topic-specific elements
      let technicalFocus = '';
      if (topicLower.includes('güneş') || topicLower.includes('solar')) {
        technicalFocus = 'solar panel arrays, photovoltaic technology, energy meters';
      } else if (topicLower.includes('ısı') || topicLower.includes('heat')) {
        technicalFocus = 'heat pump systems, thermal dynamics visualization, efficiency gauges';
      } else if (topicLower.includes('klima') || topicLower.includes('climate')) {
        technicalFocus = 'HVAC systems, air flow patterns, temperature control interfaces';
      } else if (topicLower.includes('su') || topicLower.includes('water')) {
        technicalFocus = 'water treatment systems, filtration technology, flow diagrams';
      } else {
        technicalFocus = 'advanced engineering systems, digital control panels, IoT sensors';
      }

      return `${selectedStyle}, ${technicalFocus}, professional ${blogData.topic} visualization, cutting-edge technology showcase, dynamic composition, vibrant color scheme, aspect ratio 16:9, high resolution, no people, no text, no watermarks`;
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

// [REMOVED] generateVertexImagesHourly function
// Reason: Vertex AI access no longer available
// Date: 2025-10-23
// Previous: Generated images every 15 minutes with Vertex AI Fast Model