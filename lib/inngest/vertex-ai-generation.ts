import { inngest } from "./client";
import { sql } from "../db";
import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
}

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
        sampleImageSize: "2k",  // Higher resolution for better quality
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
      const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
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
              resolve(result as CloudinaryUploadResult);
            } else {
              reject(new Error('Upload failed: No result returned'));
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

      // Fetch random elements from database tables for variety
      const [regionalTheme, colorScheme, compositionRule, stylePreset, negativePrompts] = await Promise.all([
        sql`
          SELECT region_name, visual_elements, cultural_motifs, keywords
          FROM regional_themes
          WHERE is_active = true
          ORDER BY RANDOM()
          LIMIT 1
        `,
        sql`
          SELECT name, primary_gradient, accent_colors, emotion_description
          FROM color_schemes
          WHERE is_active = true
          ORDER BY RANDOM()
          LIMIT 1
        `,
        sql`
          SELECT name, layout_type, focal_point, depth_layers, spacing_rules
          FROM composition_rules
          WHERE is_active = true
          ORDER BY RANDOM()
          LIMIT 1
        `,
        sql`
          SELECT name, main_style, effects, render_style, atmosphere
          FROM style_presets
          WHERE is_active = true
          ORDER BY RANDOM()
          LIMIT 1
        `,
        sql`
          SELECT prompt_text
          FROM negative_prompts
          WHERE is_active = true
          ORDER BY severity DESC
        `
      ]);

      const selectedRegion = regionalTheme[0];
      const selectedColorScheme = colorScheme[0];
      const selectedComposition = compositionRule[0];
      const selectedStylePreset = stylePreset[0];
      const negativePromptText = negativePrompts.map(np => np.prompt_text).join(', ');

      console.log(`[Blog Generation] Using region: ${selectedRegion?.region_name || 'default'}`);
      console.log(`[Blog Generation] Using color scheme: ${selectedColorScheme?.name || 'default'}`);
      console.log(`[Blog Generation] Using composition: ${selectedComposition?.name || 'default'}`);
      console.log(`[Blog Generation] Using style preset: ${selectedStylePreset?.name || 'default'}`);

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

DATABASE-DRIVEN ELEMENTS TO INCORPORATE:
REGIONAL THEME: ${selectedRegion ? `${selectedRegion.region_name}
- Visual elements: ${selectedRegion.visual_elements}
- Cultural motifs: ${selectedRegion.cultural_motifs}` : 'Modern technical environment'}

COLOR SCHEME: ${selectedColorScheme ? `${selectedColorScheme.name}
- Primary gradient: ${JSON.stringify(selectedColorScheme.primary_gradient)}
- Accent colors: ${JSON.stringify(selectedColorScheme.accent_colors)}
- Emotion: ${selectedColorScheme.emotion_description}` : colorPalette}

COMPOSITION: ${selectedComposition ? `${selectedComposition.name}
- Layout: ${selectedComposition.layout_type}
- Focal point: ${selectedComposition.focal_point}
- Depth: ${selectedComposition.depth_layers}` : composition}

STYLE PRESET: ${selectedStylePreset ? `${selectedStylePreset.name}
- Main style: ${selectedStylePreset.main_style}
- Effects: ${JSON.stringify(selectedStylePreset.effects)}
- Atmosphere: ${selectedStylePreset.atmosphere}` : visualStyle}

NEGATIVE ELEMENTS TO AVOID:
${negativePromptText || 'no text, no logos, no human figures'}

Time: ${timeOfDay}
Season: ${season}
Technical elements: ${technicalElements}

Mix and match these elements creatively. Ensure the prompt is unique and sophisticated.`;

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
              max_tokens: 600     // Increased for longer, more detailed prompts
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedPrompt = data.choices[0]?.message?.content?.trim();
            if (generatedPrompt) {
              // Increased limit for better prompt quality (Vertex AI can handle up to 2048 chars)
              const limitedPrompt = generatedPrompt.substring(0, 1500);
              console.log(`XAI generated prompt (limited to 1500 chars): ${limitedPrompt.substring(0, 150)}...`);
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

      // Create varied fallback prompts based on topic and database elements
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

      // Build enhanced fallback prompt using database elements
      const regionalElements = selectedRegion
        ? `${selectedRegion.visual_elements}, ${selectedRegion.cultural_motifs}, `
        : 'modern technical background, clean engineering environment, ';

      const colorElements = selectedColorScheme
        ? `gradient from ${selectedColorScheme.primary_gradient[0]} to ${selectedColorScheme.primary_gradient[1]}, accent colors ${selectedColorScheme.accent_colors[0]} and ${selectedColorScheme.accent_colors[1]}, `
        : 'vibrant color scheme, ';

      const compositionElements = selectedComposition
        ? `${selectedComposition.layout_type} composition, ${selectedComposition.focal_point}, ${selectedComposition.depth_layers}, `
        : 'dynamic composition, ';

      const styleElements = selectedStylePreset
        ? `${selectedStylePreset.main_style}, ${selectedStylePreset.atmosphere}, ${selectedStylePreset.render_style} rendering, `
        : `${selectedStyle}, `;

      const negativeElements = negativePromptText
        ? `, ${negativePromptText}`
        : ', no people, no text, no watermarks';

      return `${technicalFocus}, ${styleElements}${regionalElements}${colorElements}${compositionElements}professional ${blogData.topic} visualization, cutting-edge technology showcase, aspect ratio 16:9, high resolution${negativeElements}`;
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

// Generate images with Vertex AI every 5 minutes using fast model
export const generateVertexImagesHourly = inngest.createFunction(
  {
    id: "generate-vertex-images-5min",
    name: "Generate Vertex AI Images Every 5 Minutes (Fast Model)",
    retries: 2
  },
  [
    {
      // Run every 5 minutes (288 images/day) - using fast model for cost optimization
      cron: "*/5 * * * *"
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

      // Check recently used prompts to avoid repetition
      const recentPrompts = await sql`
        SELECT prompt, enhanced_prompt
        FROM vertex_images
        WHERE metadata->>'service' = ${selectedService.hizmet_adi}
          AND created_at > NOW() - INTERVAL '48 hours'
        ORDER BY created_at DESC
        LIMIT 5
      `;

      console.log(`[10min Generation] Found ${recentPrompts.length} recent prompts for ${selectedService.hizmet_adi}`);

      // Get related brands for this service for more variation
      const relatedBrands = await sql`
        SELECT DISTINCT m.marka_adi, m.aciklama
        FROM markalar m
        WHERE EXISTS (
          SELECT 1 FROM hizmetler h
          WHERE h.id = ${selectedService.id}
            AND m.airtable_hizmetler_id::text LIKE '%' || h.id || '%'
        )
        LIMIT 5
      `;

      console.log(`[10min Generation] Found ${relatedBrands.length} related brands for service`);

      // Get related products for variation
      const relatedProducts = await sql`
        SELECT u.urun_adi, u.kategori
        FROM (
          SELECT DISTINCT urun_adi, kategori
          FROM urunler
          WHERE kategori = ${selectedService.kategori || selectedService.hizmet_adi}
        ) u
        ORDER BY RANDOM()
        LIMIT 3
      `;

      console.log(`[10min Generation] Found ${relatedProducts.length} related products`);

      // Get dynamic color scheme from database
      const topicKey = selectedService.slug?.replace(/-/g, '_') || 'default';
      const colorScheme = await sql`
        SELECT name, primary_gradient, accent_colors, emotion_description
        FROM color_schemes
        WHERE (topic_key = ${topicKey} OR topic_key = 'default')
          AND is_active = true
        ORDER BY
          CASE WHEN topic_key = ${topicKey} THEN 0 ELSE 1 END,
          RANDOM()
        LIMIT 1
      `;

      const selectedColorScheme = colorScheme[0];
      console.log(`[10min Generation] Using color scheme: ${selectedColorScheme?.name || 'default'}`);

      // Get random composition rule from database
      const compositionRule = await sql`
        SELECT name, layout_type, layout_description, focal_point, spacing_rules, depth_layers, margin_rules
        FROM composition_rules
        WHERE is_active = true
        ORDER BY RANDOM()
        LIMIT 1
      `;

      const selectedComposition = compositionRule[0];
      console.log(`[10min Generation] Using composition rule: ${selectedComposition?.name || 'default'}`);

      // Get random style preset from database
      const stylePreset = await sql`
        SELECT name, main_style, effects, render_style, atmosphere, technical_specs
        FROM style_presets
        WHERE is_active = true
        ORDER BY RANDOM()
        LIMIT 1
      `;

      const selectedStylePreset = stylePreset[0];
      console.log(`[10min Generation] Using style preset: ${selectedStylePreset?.name || 'default'}`);

      // Get random regional theme from database
      const regionalTheme = await sql`
        SELECT region_name, visual_elements, cultural_motifs
        FROM regional_themes
        WHERE is_active = true
        ORDER BY RANDOM()
        LIMIT 1
      `;

      const selectedRegion = regionalTheme[0];
      console.log(`[10min Generation] Using regional theme: ${selectedRegion?.region_name || 'default'}`);

      // Get negative prompts from database
      const negativePrompts = await sql`
        SELECT prompt_text, severity
        FROM negative_prompts
        WHERE is_active = true
        ORDER BY severity DESC
      `;

      // Combine negative prompts into a single string
      const negativePromptText = negativePrompts
        .map(np => np.prompt_text)
        .join(', ');

      console.log(`[10min Generation] Using ${negativePrompts.length} negative prompts`);

      // Generate dynamic prompt with XAI based on service
      let finalPrompt = "";

      const apiKey = process.env.XAI_API_KEY;
      console.log(`[10min Generation] XAI API Key status: ${apiKey ? 'Found' : 'NOT FOUND - will use fallback'}`);
      console.log(`[10min Generation] Generating prompt for service: ${selectedService.hizmet_adi} (index: ${serviceIndex})`);

      if (apiKey) {
        try {
          const systemPrompt = `You are an expert at creating highly detailed, visually rich prompts for Vertex AI Imagen 3.0 following Google's best practices.
Your task is to create sophisticated prompts for engineering service hero banner illustrations with 16:9 aspect ratio.

IMPORTANT: Each prompt MUST use a DIFFERENT visual style from the variation style provided.

ADVANCED PROMPT STRUCTURE:
1. PRIMARY SUBJECT: Detailed technical visualization with specific components
2. VISUAL ELEMENTS:
   - Concrete: Physical components, machinery, systems
   - Abstract: Energy flows, data streams, particle effects
   - Technical: Diagrams, cross-sections, measurement indicators
3. STYLE: MUST incorporate the provided variation style creatively
4. COMPOSITION: ${selectedComposition ? `
   - Layout: ${selectedComposition.layout_type} - ${selectedComposition.layout_description}
   - Focal point: ${selectedComposition.focal_point}
   - Spacing: ${selectedComposition.spacing_rules}
   - Depth: ${selectedComposition.depth_layers}
   - Margins: ${selectedComposition.margin_rules}` : `
   - 60/40 asymmetrical balance
   - Golden ratio focal points
   - 30% negative space for text overlay
   - 3-layer depth (background gradient, main illustration, foreground accents)`}
5. COLOR SCHEME: ${selectedColorScheme ? `
   - Primary colors: ${JSON.stringify(selectedColorScheme.primary_gradient)}
   - Accent colors: ${JSON.stringify(selectedColorScheme.accent_colors)}
   - Emotion: ${selectedColorScheme.emotion_description}` : `
   - Primary gradient transitions
   - Hex color specifications
   - Complementary accent colors
   - Emotional color psychology`}
6. LIGHTING: Multi-source lighting with specific directions and intensities
7. ATMOSPHERE: Regional elements (Mediterranean, Bodrum, coastal)
8. TECHNICAL SPECS: High resolution, retina-ready, strong contrast for readability

REQUIREMENTS:
- Create rich, multi-layered descriptions
- Use 2025 trending hex colors:
  * Ethereal Blues: #A8DAEF, #B4E0F0, #7FC8E8
  * Creamy Pastels: #FFE4E1, #FFF0E5, #F5E6D3
  * Burnt Orange: #CC5500, #E65100, #FF6F00
  * Seafoam Green: #93E9BE, #A7F3D0, #86EFAC
  * Rich Burgundy: #722F37, #800020, #4A0E15
  * Eggplant: #614051, #563C5C, #4B384C
- Include technical details and measurements
- Specify material properties (glass, metal, translucent)
- Add particle effects and energy visualizations
- Include subtle background patterns
- Specify exact positioning (left third, upper right, etc.)

NEGATIVE PROMPTS (MUST AVOID):
${negativePromptText ? negativePromptText : `- Generic descriptions
- Vague color terms
- Simple compositions
- Text, logos, watermarks
- Human figures, faces
- Photorealistic style
- Stock photo aesthetics`}

IMPORTANT: The final prompt should NOT include any of the negative elements above.`;

          // Dynamic context from database
          const brandsContext = relatedBrands.length > 0
            ? `Related brands: ${relatedBrands.map(b => b.marka_adi).join(', ')}`
            : '';

          const productsContext = relatedProducts.length > 0
            ? `Related products: ${relatedProducts.map(p => p.urun_adi).join(', ')}`
            : '';

          // Create variation seed to ensure different prompts - using minutes and service index for more variety
          const now = new Date();
          const variationSeed = (now.getMinutes() + now.getHours() + serviceIndex) % 30;

          // Expanded variation styles - 30 different styles for better variety
          const variationStyles = [
            'ultra-modern minimalist, clean lines, negative space, helvetica aesthetic',
            'technical blueprint style, CAD wireframe aesthetics, engineering precision',
            'photorealistic 3D render, octane render quality, ray tracing, cinematic lighting',
            'isometric 3D illustration, vibrant gradients, low poly style',
            'futuristic holographic display, neon accents, cyberpunk atmosphere',
            'architectural visualization, golden hour lighting, photorealistic materials',
            'industrial design showcase, dramatic shadows, product photography style',
            'eco-friendly green technology, organic shapes, nature integration',
            'high-tech laboratory, clean room environment, sterile aesthetic',
            'abstract geometric patterns, bold color blocks, bauhaus inspired',
            'watercolor illustration, soft edges, artistic interpretation',
            'retro-futuristic style, 80s aesthetic, synthwave colors',
            'flat design with depth, material design principles, subtle shadows',
            'technical cutaway view, exploded diagram, component visualization',
            'art deco inspired, geometric patterns, luxury aesthetic',
            'japanese minimalism, zen aesthetic, wabi-sabi elements',
            'scandinavian design, hygge atmosphere, natural materials',
            'brutalist architecture style, concrete textures, monolithic forms',
            'Memphis design movement, playful geometry, vibrant patterns',
            'swiss design style, grid-based layout, typography focus',
            'vaporwave aesthetic, surreal elements, pastel gradients',
            'constructivist style, dynamic angles, revolutionary aesthetic',
            'art nouveau inspired, flowing organic lines, ornamental details',
            'digital glitch art, data visualization, matrix aesthetic',
            'parametric design, algorithmic patterns, computational geometry',
            'biomimicry design, nature-inspired forms, organic technology',
            'deconstructivist style, fragmented forms, dynamic chaos',
            'neo-brutalism, raw materials, bold typography elements',
            'maximalist design, rich details, layered complexity',
            'photomontage style, collage elements, mixed media aesthetic'
          ];

          const selectedVariation = variationStyles[variationSeed];

          // Check if any recent prompts exist and create exclusion context
          const avoidElements = recentPrompts.length > 0
            ? `IMPORTANT: Create something DIFFERENT from these recent prompts: ${recentPrompts[0].prompt?.substring(0, 150)}...`
            : '';

          const userPrompt = `Create a UNIQUE and CREATIVE Vertex AI Imagen 3.0 prompt for this engineering service hero banner:

SERVICE: ${selectedService.hizmet_adi}
DESCRIPTION: ${selectedService.aciklama || 'Professional engineering service'}
${brandsContext}
${productsContext}

CREATIVE ELEMENTS FROM DATABASE:
VARIATION STYLE: ${selectedVariation}
COLOR PALETTE: ${selectedColorScheme ? `${selectedColorScheme.name} - ${selectedColorScheme.emotion_description}
Primary Gradient: ${JSON.stringify(selectedColorScheme.primary_gradient)}
Accent Colors: ${JSON.stringify(selectedColorScheme.accent_colors)}` : 'Use creative neon colors'}
COMPOSITION RULE: ${selectedComposition ? `${selectedComposition.name}
- Layout: ${selectedComposition.layout_type}
- Focal Point: ${selectedComposition.focal_point}
- Depth Layers: ${selectedComposition.depth_layers}` : 'Dynamic composition'}
STYLE PRESET: ${selectedStylePreset ? `${selectedStylePreset.name}
- Main Style: ${selectedStylePreset.main_style}
- Effects: ${JSON.stringify(selectedStylePreset.effects)}
- Render: ${selectedStylePreset.render_style}
- Atmosphere: ${selectedStylePreset.atmosphere}` : 'Modern technical style'}

ASPECT RATIO: 16:9 (1920x1080)
PURPOSE: Blog hero banner with text overlay capability

NEGATIVE ELEMENTS TO AVOID:
${negativePromptText || 'no text, no logos, no human figures, no photorealistic style'}

${avoidElements}

Generate a sophisticated, UNIQUE prompt that includes:
1. Specific technical components for ${selectedService.hizmet_adi}
${relatedBrands.length > 0 ? `2. Feature equipment from brands like ${relatedBrands[0].marka_adi}` : ''}
${relatedProducts.length > 0 ? `3. Include products such as ${relatedProducts[0].urun_adi}` : ''}
4. Use variation style: ${selectedVariation}
5. MUST use these specific colors: ${selectedColorScheme ? JSON.stringify(selectedColorScheme.primary_gradient) : 'neon colors'}
6. Unique composition and perspective
7. Fresh visual metaphors and elements

IMPORTANT: Be creative and avoid generic descriptions. Make this prompt distinctly different.
Return ONLY the detailed prompt, no explanations.`;

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
              max_tokens: 600
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedPrompt = data.choices[0]?.message?.content?.trim();
            if (generatedPrompt) {
              // Increased limit for better prompt quality (Vertex AI can handle up to 2048 chars)
              finalPrompt = generatedPrompt.substring(0, 1500);
              console.log(`[10min Generation] ✅ XAI prompt generated successfully for ${selectedService.hizmet_adi}`);
              console.log(`[10min Generation] Prompt preview (first 200 chars): ${finalPrompt.substring(0, 200)}...`);
            } else {
              console.log(`[10min Generation] ⚠️ XAI returned empty prompt`);
            }
          } else {
            console.log(`[10min Generation] ❌ XAI API request failed with status: ${response.status}`);
          }
        } catch (error) {
          console.error("[10min Generation] Error generating prompt with XAI:", error);
          console.log("[10min Generation] XAI error details:", error instanceof Error ? error.message : error);
        }
      } else {
        console.warn("[10min Generation] ⚠️ XAI_API_KEY not found in environment variables!");
      }

      // Fallback to enhanced static prompt if XAI fails or is not available
      if (!finalPrompt) {
        const description = (selectedService.aciklama || selectedService.hizmet_adi).toLowerCase();

        // Dynamic keyword detection based on service description
        const keywords = description.split(/[\s,.-]+/).filter((word: string) => word.length > 2);

        // Enhanced service-specific elements with detailed descriptions
        let primarySubject = "";
        let visualElements = "";

        // Use database color scheme if available, otherwise fallback
        let colorScheme = "";
        if (selectedColorScheme) {
          const colors = selectedColorScheme.primary_gradient as string[];
          colorScheme = `gradient from ${colors[0]} to ${colors[1]}, accent colors ${colors[2]} and ${colors[3]}`;
        } else {
          colorScheme = "";
        }

        if (keywords.some((word: string) => ['güneş', 'solar', 'photovoltaic', 'panel'].includes(word))) {
          primarySubject = 'photovoltaic solar panel array with visible silicon cell grid';
          visualElements = 'sun rays transforming into electrical circuits, particle energy flow visualization, inverter unit with LED indicators';
          if (!selectedColorScheme) colorScheme = 'gradient from #FF6F00 burnt orange to #A8DAEF ethereal blue, with #93E9BE seafoam green accents';
        } else if (keywords.some((word: string) => ['ısı', 'heat', 'pump', 'pompa', 'ısıtma'].includes(word))) {
          primarySubject = 'heat pump system with copper coil spirals and compressor unit cutaway';
          visualElements = 'temperature gradient waves flowing between hot and cold zones, refrigerant cycle visualization, efficiency meter display';
          if (!selectedColorScheme) colorScheme = 'gradient from #CC5500 burnt orange to #7FC8E8 ethereal blue, with #FFE4E1 creamy pastel highlights';
        } else if (keywords.some((word: string) => ['klima', 'soğutma', 'havalandırma', 'conditioning'].includes(word))) {
          primarySubject = 'modern air conditioning unit with visible airflow patterns';
          visualElements = 'cool air particle streams, temperature control interface, fresh air circulation vectors';
          if (!selectedColorScheme) colorScheme = 'gradient from #B4E0F0 ethereal blue to #93E9BE seafoam green, with #FFF0E5 creamy pastel accents';
        } else if (keywords.some((word: string) => ['su', 'water', 'arıtma', 'filtrasyon', 'purification'].includes(word))) {
          primarySubject = 'multi-stage water filtration system with transparent chambers';
          visualElements = 'water molecules transforming from dark to crystal clear, sediment layer visualization, reverse osmosis membrane cross-section';
          if (!selectedColorScheme) colorScheme = 'gradient from #7FC8E8 ethereal blue to #A7F3D0 seafoam green, with #F5E6D3 creamy beige highlights';
        } else if (keywords.some((word: string) => ['neon', 'tabela', 'aydınlatma', 'sign', 'lighting'].includes(word))) {
          primarySubject = 'glowing neon tubes forming geometric patterns';
          visualElements = 'luminous gas particles flowing through glass tubes, electric arc visualization, transformer unit diagram';
          if (!selectedColorScheme) colorScheme = 'gradient from #614051 eggplant to #E65100 burnt orange, with #A8DAEF ethereal blue glow effects';
        } else if (keywords.some((word: string) => ['baca', 'chimney', 'duman', 'smoke', 'exhaust'].includes(word))) {
          primarySubject = 'industrial chimney system with filtration components';
          visualElements = 'smoke particle filtration process, airflow direction indicators, emission control visualization';
          if (!selectedColorScheme) colorScheme = 'gradient from #4B384C eggplant gray to #FFE4E1 misty rose, with #86EFAC fresh mint accents';
        } else {
          // Enhanced generic elements with 2025 trending colors
          primarySubject = `professional ${selectedService.hizmet_adi.toLowerCase()} system components`;
          visualElements = 'technical flow diagrams, efficiency metrics visualization, component connection paths';
          if (!selectedColorScheme) colorScheme = 'gradient from #722F37 rich burgundy to #B4E0F0 ethereal blue, with #93E9BE seafoam accent';
        }

        // Build enhanced fallback prompt with rich details - using dynamic style variation
        const fallbackStyleVariations = [
          'modern editorial vector illustration, flat design with glass morphism effects',
          'photorealistic 3D render with depth of field, cinematic composition',
          'technical blueprint style illustration, precise line work, CAD aesthetic',
          'isometric pixel art style, retro gaming aesthetic, vibrant colors',
          'watercolor and ink illustration, artistic brush strokes, organic flow',
          'art deco inspired design, geometric patterns, metallic accents',
          'brutalist design approach, bold shapes, high contrast elements',
          'minimalist japanese ink wash, negative space, zen composition',
          'cyberpunk neon aesthetic, holographic elements, dark atmosphere',
          'scandinavian flat design, pastel colors, cozy atmosphere'
        ];

        // Use time-based selection for fallback style too
        const fallbackStyleIndex = (new Date().getMinutes() + serviceIndex) % fallbackStyleVariations.length;
        const selectedFallbackStyle = fallbackStyleVariations[fallbackStyleIndex];

        // Build composition details from database or use defaults
        const compositionDetails = selectedComposition
          ? `${selectedComposition.layout_type} composition, ${selectedComposition.focal_point}, ${selectedComposition.depth_layers}, ${selectedComposition.spacing_rules}`
          : '60/40 asymmetrical composition with golden ratio focal point, 3-layer depth with background gradient and foreground accents';

        // Include style preset details if available
        const stylePresetDetails = selectedStylePreset
          ? `, ${selectedStylePreset.main_style}, ${selectedStylePreset.atmosphere}, ${selectedStylePreset.render_style} rendering`
          : '';

        // Add negative prompts to fallback
        const negativeElements = negativePromptText
          ? `, ${negativePromptText}`
          : ', no text, no typography, no logos, no watermarks, no human figures, no faces, no photorealistic style';

        // Use regional theme background if available, otherwise clean tech background
        const backgroundElement = selectedRegion && selectedRegion.visual_elements
          ? selectedRegion.visual_elements.substring(0, 100)
          : 'clean technical background, modern engineering environment';

        finalPrompt = `${primarySubject}, ${visualElements}, ${selectedFallbackStyle}${stylePresetDetails}, ${backgroundElement}, bright multi-directional lighting with soft shadows, ${colorScheme}, professional and innovative atmosphere, ${compositionDetails}, 30% negative space for text overlay, high contrast for readability${negativeElements}`;

        console.log(`[10min Generation] Using enhanced fallback prompt for service: ${selectedService.hizmet_adi}`);
        console.log(`[10min Generation] Fallback reason: ${!apiKey ? 'No API key' : 'XAI generation failed'}`);
      }

      // Add aspect ratio and negative prompts if not already included
      if (!finalPrompt.includes('no text') && !finalPrompt.includes('no logo')) {
        // Add negative prompts to the end if XAI didn't include them
        const negativeAppend = negativePromptText
          ? `, ${negativePromptText}`
          : ', no text, no logos, no watermarks, no human figures';

        finalPrompt = finalPrompt.substring(0, 1300) + negativeAppend + `, 16:9 aspect ratio`;
      } else {
        // XAI already included negative prompts
        finalPrompt = finalPrompt.substring(0, 1500) + `, 16:9 aspect ratio`;
      }

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
          sampleImageSize: "2k", // Higher resolution for better quality
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
          // Convert base64 to buffer for more efficient upload
          const imageBuffer = Buffer.from(imageBase64, 'base64');

          // Upload using stream method
          uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'vertex-ai-services',
                public_id: `service-${slug}-${Date.now()}`,
                resource_type: 'image',
                format: 'png',
                tags: ['vertex-ai', 'service-image', 'fast-model', slug],
                context: {
                  prompt: prompt.slice(0, 200),
                  service: service,
                  model: 'imagen-3.0-fast-generate-001',
                  generated_at: new Date().toISOString()
                }
              },
              (error, result) => {
                if (error) {
                  console.error('Cloudinary stream upload error:', error);
                  reject(error);
                } else if (result) {
                  resolve(result as CloudinaryUploadResult);
                } else {
                  reject(new Error('Upload failed: No result returned'));
                }
              }
            );

            // Write buffer to stream and close
            uploadStream.end(imageBuffer);
          });

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
            prompt: prompt.substring(0, 200),
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