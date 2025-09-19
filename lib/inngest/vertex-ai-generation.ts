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
      event: "vertex-ai/5min.manual"
    }
  ],
  async ({ step }) => {
    // Step 1: Get services from database and determine next service with location
    const { service, prompt, slug, serviceIndex, location, locationIndex } = await step.run("determine-service-and-prompt", async () => {
      // Bodrum and surrounding area locations
      const locations = [
        // Bodrum Peninsula - Main Districts
        { name: "Bodrum Merkez", description: "historic marina district with castle views" },
        { name: "Gümbet", description: "vibrant beach resort area" },
        { name: "Bitez", description: "tranquil bay with citrus groves" },
        { name: "Ortakent", description: "traditional village with long sandy beach" },
        { name: "Turgutreis", description: "sunset coast with modern marina" },
        { name: "Yalıkavak", description: "luxury marina and windmill views" },
        { name: "Gündoğan", description: "peaceful bay surrounded by hills" },
        { name: "Göltürkbükü", description: "exclusive twin bays area" },
        { name: "Türkbükü", description: "upscale seaside resort" },
        { name: "Gölköy", description: "hidden cove with crystal waters" },
        { name: "Torba", description: "quiet bay with olive groves" },
        { name: "Güvercinlik", description: "family-friendly coastal town" },
        { name: "Yalıçiftlik", description: "authentic village by the sea" },
        { name: "Kızılağaç", description: "rural area with vineyards" },
        { name: "Mumcular", description: "mountain village with panoramic views" },
        { name: "Mazı", description: "secluded bay with ancient ruins" },
        { name: "Akyarlar", description: "windsurfing paradise" },
        { name: "Kadıkalesi", description: "historic peninsula with ancient harbor" },
        { name: "Gümüşlük", description: "artistic village on ancient Myndos" },

        // Milas Region
        { name: "Milas Merkez", description: "historic city with Ottoman architecture" },
        { name: "Ören", description: "long beach town with thermal springs" },
        { name: "Güllük", description: "fishing port with island views" },
        { name: "Boğaziçi", description: "lakeside town near airport" },

        // Muğla Province Coastal
        { name: "Didim", description: "resort town with ancient Temple of Apollo" },
        { name: "Altınkum", description: "golden beach resort area" },
        { name: "Akbük", description: "serene bay with pine forests" },
        { name: "Datça", description: "peninsula town with almonds and olives" },
        { name: "Marmaris", description: "major yacht harbor with castle" },
        { name: "İçmeler", description: "beach resort near Marmaris" },
        { name: "Fethiye", description: "turquoise coast with lycian tombs" },
        { name: "Göcek", description: "exclusive yacht destination" }
      ];

      // Get all services from database
      const services = await sql`
        SELECT id, hizmet_adi, slug, aciklama
        FROM hizmetler
        ORDER BY id
      `;

      // Get the last generated image to determine next service and location
      const lastImage = await sql`
        SELECT metadata
        FROM vertex_images
        ORDER BY created_at DESC
        LIMIT 1
      `;

      let serviceIndex = 0;
      let locationIndex = 0;

      if (lastImage.length > 0 && lastImage[0].metadata) {
        // Get next service in sequence
        if (lastImage[0].metadata.serviceIndex !== undefined) {
          serviceIndex = (lastImage[0].metadata.serviceIndex + 1) % services.length;
        }
        // Get next location in sequence
        if (lastImage[0].metadata.locationIndex !== undefined) {
          locationIndex = (lastImage[0].metadata.locationIndex + 1) % locations.length;
        } else {
          // Random start if no previous location index
          locationIndex = Math.floor(Math.random() * locations.length);
        }
      }

      const selectedService = services[serviceIndex];
      const selectedLocation = locations[locationIndex];

      // Check recently used prompts to avoid repetition
      const recentPrompts = await sql`
        SELECT prompt, enhanced_prompt
        FROM vertex_images
        WHERE metadata->>'service' = ${selectedService.hizmet_adi}
          AND created_at > NOW() - INTERVAL '48 hours'
        ORDER BY created_at DESC
        LIMIT 5
      `;

      console.log(`[5min Generation] Found ${recentPrompts.length} recent prompts for ${selectedService.hizmet_adi}`);

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

      console.log(`[5min Generation] Found ${relatedBrands.length} related brands for service`);

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

      console.log(`[5min Generation] Found ${relatedProducts.length} related products`);

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
      console.log(`[5min Generation] Using color scheme: ${selectedColorScheme?.name || 'default'}`);
      console.log(`[5min Generation] Selected location: ${selectedLocation.name} - ${selectedLocation.description}`);

      // Generate dynamic prompt with XAI based on service and location
      let finalPrompt = "";

      const apiKey = process.env.XAI_API_KEY;
      console.log(`[5min Generation] XAI API Key status: ${apiKey ? 'Found' : 'NOT FOUND - will use fallback'}`);
      console.log(`[5min Generation] Generating prompt for service: ${selectedService.hizmet_adi} in ${selectedLocation.name} (index: ${serviceIndex})`);

      if (apiKey) {
        try {
          const systemPrompt = `You are an expert at creating highly detailed, visually rich prompts for Vertex AI Imagen 3.0 following Google's best practices.
Your task is to create sophisticated prompts for engineering service hero banner illustrations with 16:9 aspect ratio.

ADVANCED PROMPT STRUCTURE:
1. PRIMARY SUBJECT: Detailed technical visualization with specific components
2. VISUAL ELEMENTS:
   - Concrete: Physical components, machinery, systems
   - Abstract: Energy flows, data streams, particle effects
   - Technical: Diagrams, cross-sections, measurement indicators
3. STYLE: Modern editorial vector illustration, flat design with gradients, glass morphism, isometric elements
4. COMPOSITION:
   - 60/40 asymmetrical balance
   - Golden ratio focal points
   - 30% negative space for text overlay
   - 3-layer depth (background gradient, main illustration, foreground accents)
5. COLOR SCHEME: ${selectedColorScheme ? `
   - Primary colors: ${JSON.stringify(selectedColorScheme.primary_gradient)}
   - Accent colors: ${JSON.stringify(selectedColorScheme.accent_colors)}
   - Emotion: ${selectedColorScheme.emotion_description}` : `
   - Primary gradient transitions
   - Hex color specifications
   - Complementary accent colors
   - Emotional color psychology`}
6. LIGHTING: Multi-source lighting with specific directions and intensities
7. ATMOSPHERE: Location-specific regional elements (Mediterranean coastal architecture)
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

AVOID:
- Generic descriptions
- Vague color terms
- Simple compositions
- Text, logos, watermarks
- Human figures, faces
- Photorealistic style
- Stock photo aesthetics`;

          // Dynamic context from database
          const brandsContext = relatedBrands.length > 0
            ? `Related brands: ${relatedBrands.map(b => b.marka_adi).join(', ')}`
            : '';

          const productsContext = relatedProducts.length > 0
            ? `Related products: ${relatedProducts.map(p => p.urun_adi).join(', ')}`
            : '';

          // Create variation seed to ensure different prompts
          const variationSeed = new Date().getTime() % 10;
          const variationStyles = [
            'ultra-modern minimalist, clean lines, negative space',
            'technical blueprint style, CAD wireframe aesthetics',
            'photorealistic product showcase, studio lighting',
            'isometric 3D illustration, vibrant gradients',
            'futuristic holographic display, neon accents',
            'architectural visualization, golden hour lighting',
            'industrial design showcase, dramatic shadows',
            'eco-friendly green technology, organic shapes',
            'high-tech laboratory, clean room environment',
            'abstract geometric patterns, bold color blocks'
          ];

          const selectedVariation = variationStyles[variationSeed];

          // Check if any recent prompts exist and create exclusion context
          const avoidElements = recentPrompts.length > 0
            ? `IMPORTANT: Create something DIFFERENT from these recent prompts: ${recentPrompts[0].prompt?.substring(0, 150)}...`
            : '';

          const userPrompt = `Create a UNIQUE and CREATIVE Vertex AI Imagen 3.0 prompt for this engineering service hero banner:

SERVICE: ${selectedService.hizmet_adi}
LOCATION: ${selectedLocation.name} - ${selectedLocation.description}
DESCRIPTION: ${selectedService.aciklama || 'Professional engineering service'}
${brandsContext}
${productsContext}
VARIATION STYLE: ${selectedVariation}
COLOR PALETTE: ${selectedColorScheme ? `${selectedColorScheme.name} - ${selectedColorScheme.emotion_description}
Primary Gradient: ${JSON.stringify(selectedColorScheme.primary_gradient)}
Accent Colors: ${JSON.stringify(selectedColorScheme.accent_colors)}` : 'Use creative neon colors'}
ASPECT RATIO: 16:9 (1920x1080)
PURPOSE: Blog hero banner with text overlay capability

${avoidElements}

Generate a sophisticated, UNIQUE prompt that includes:
1. Specific technical components for ${selectedService.hizmet_adi} installation in ${selectedLocation.name}
2. Background elements featuring ${selectedLocation.description} atmosphere
${relatedBrands.length > 0 ? `3. Feature equipment from brands like ${relatedBrands[0].marka_adi}` : ''}
${relatedProducts.length > 0 ? `4. Include products such as ${relatedProducts[0].urun_adi}` : ''}
5. Use variation style: ${selectedVariation}
6. MUST use these specific colors: ${selectedColorScheme ? JSON.stringify(selectedColorScheme.primary_gradient) : 'neon colors'}
7. Integrate location-specific architectural or landscape elements
8. Unique composition and perspective showcasing the local environment

IMPORTANT: Be creative and avoid generic descriptions. Make this prompt distinctly different.
Include specific location details that make it clear this is in ${selectedLocation.name}.
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
              max_tokens: 300
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedPrompt = data.choices[0]?.message?.content?.trim();
            if (generatedPrompt) {
              // Increased limit for better prompt quality (Vertex AI can handle up to 2048 chars)
              finalPrompt = generatedPrompt.substring(0, 900);
              console.log(`[5min Generation] ✅ XAI prompt generated successfully for ${selectedService.hizmet_adi}`);
              console.log(`[5min Generation] Prompt preview (first 200 chars): ${finalPrompt.substring(0, 200)}...`);
            } else {
              console.log(`[5min Generation] ⚠️ XAI returned empty prompt`);
            }
          } else {
            console.log(`[5min Generation] ❌ XAI API request failed with status: ${response.status}`);
          }
        } catch (error) {
          console.error("[5min Generation] Error generating prompt with XAI:", error);
          console.log("[5min Generation] XAI error details:", error instanceof Error ? error.message : error);
        }
      } else {
        console.warn("[5min Generation] ⚠️ XAI_API_KEY not found in environment variables!");
      }

      // Dynamic fallback if XAI fails - create random creative prompts
      if (!finalPrompt) {
        // TEMPORARY: Commenting out static fallback prompts to force more dynamic generation
        // TODO: Re-enable with better dynamic generation after testing

        /*
        // Static fallback code - DISABLED for testing
        const description = (selectedService.aciklama || selectedService.hizmet_adi).toLowerCase();
        ... [previous fallback code] ...
        */

        // Simple dynamic fallback with high randomization
        const styles = [
          "futuristic holographic visualization",
          "abstract geometric art style",
          "minimalist line art illustration",
          "vibrant gradient mesh design",
          "isometric 3D technical drawing",
          "neon glow cyberpunk aesthetic",
          "watercolor artistic interpretation",
          "retro-futuristic poster design"
        ];

        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        const randomColor1 = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        const randomColor2 = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

        // Very simple prompt to encourage AI creativity
        finalPrompt = `${selectedService.hizmet_adi} technology in ${selectedLocation.name}, ${randomStyle}, gradient from ${randomColor1} to ${randomColor2}, ${selectedLocation.description} environment, creative interpretation, 16:9 aspect ratio`;

        console.log(`[5min Generation] Using simple dynamic fallback for: ${selectedService.hizmet_adi} in ${selectedLocation.name}`);
        console.log(`[5min Generation] Style: ${randomStyle}, Colors: ${randomColor1} to ${randomColor2}`);
        console.log(`[5min Generation] Fallback reason: ${!apiKey ? 'No API key' : 'XAI generation failed'}`);
      }

      // Add aspect ratio and location tag - Vertex AI can handle up to 2048 chars safely
      finalPrompt = finalPrompt.substring(0, 1000) + `, ${selectedLocation.name} location, 16:9 aspect ratio`;

      return {
        service: selectedService.hizmet_adi,
        prompt: finalPrompt,
        slug: selectedService.slug,
        serviceIndex: serviceIndex,
        location: selectedLocation,
        locationIndex: locationIndex
      };
    });

    // Step 2: Check if similar image was generated recently
    await step.run("check-recent-generation", async () => {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const recent = await sql`
        SELECT id, prompt, created_at
        FROM vertex_images
        WHERE created_at > ${fiveMinutesAgo}
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
          // Convert base64 to buffer for more efficient upload
          const imageBuffer = Buffer.from(imageBase64, 'base64');

          // Upload using stream method
          uploadResult = await new Promise<{secure_url: string; public_id: string}>((resolve, reject) => {
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
                  resolve(result as {secure_url: string; public_id: string});
                } else {
                  reject(new Error('Upload failed: no result'));
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
              location: location.name,
              locationDescription: location.description,
              locationIndex: locationIndex,
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
    await step.run("log-5min-generation", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'vertex-ai.5min.generation',
          'cron',
          ${generationResult.success ? 'completed' : 'failed'},
          ${JSON.stringify({
            service: service,
            slug: slug,
            location: location.name,
            prompt: prompt.substring(0, 200),
            hour: new Date().getHours(),
            serviceIndex: serviceIndex,
            locationIndex: locationIndex
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
      location: location.name,
      prompt: prompt,
      timestamp: new Date().toISOString(),
      message: generationResult.success
        ? `5-minute interval image generation triggered for ${service} in ${location.name} (${slug})`
        : `Failed to generate image: ${'error' in generationResult ? generationResult.error : 'Unknown error'}`
    };
  }
);