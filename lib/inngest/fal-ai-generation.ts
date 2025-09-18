import { inngest } from "./client";
import { sql } from "../db";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Vertex AI response interface for blog image generation
interface VertexAIResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  prompt: string;
}

// Cloudinary'ye görsel yükleme
async function uploadToCloudinary(imageUrl: string, prompt: string): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'blog-images',
      public_id: `blog-img-${Date.now()}`,
      tags: ['ai-generated', 'blog-content'],
      context: {
        prompt: prompt.slice(0, 200),
        generated_at: new Date().toISOString(),
        ai_model: 'fal-ai'
      },
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

// Blog için resim üretme - Vertex AI
export const generateImageForBlog = inngest.createFunction(
  { 
    id: "generate-blog-image",
    name: "Generate Blog Image with Fal.ai",
    retries: 2
  },
  { event: "blog/image.generate.requested" },
  async ({ event, step }) => {
    const {
      blogId,
      prompt
    } = event.data as {
      blogId: number;
      prompt: string;
    };

    // Step 1: Blog kaydını ve prompt'u kontrol et
    interface BlogPost {
      id: number;
      title: string;
      topic: string;
      content: string;
      status: string;
      prompt: string | null;
      image_prompt: string | null;
      keywords?: string[] | null;
    }

    const blogPost = await step.run("check-blog-post", async (): Promise<BlogPost> => {
      const result = await sql`
        SELECT id, title, topic, content, status, prompt, image_prompt, keywords
        FROM generated_content
        WHERE id = ${blogId}
      `;

      if (result.length === 0) {
        throw new Error(`Blog post with ID ${blogId} not found`);
      }

      return result[0] as BlogPost;
    });

    // Step 1.5: Eğer prompt boşsa, mevcut prompt'u kullan veya XAI ile üret
    const finalPrompt = await step.run("prepare-prompt", async () => {
      // Eğer parametrede prompt varsa onu kullan
      if (prompt && prompt.trim() !== "") {
        return prompt;
      }
      
      // Blog kaydında prompt varsa onu kullan
      if (blogPost.prompt && blogPost.prompt.trim() !== "") {
        console.log(`Using existing prompt from database for blog ${blogId}`);
        return blogPost.prompt;
      }
      
      // Blog kaydında image_prompt varsa onu kullan
      if (blogPost.image_prompt && blogPost.image_prompt.trim() !== "") {
        console.log(`Using existing image_prompt from database for blog ${blogId}`);
        return blogPost.image_prompt;
      }

      // Hiç prompt yoksa, gelişmiş sistem ile dinamik prompt üret
      console.log(`No prompt found, generating dynamic prompt with advanced system for blog ${blogId}`);

      // Fetch random elements from database tables for variety
      const [regionalTheme, colorScheme, stylePreset, negativePrompts] = await Promise.all([
        sql`
          SELECT region_name, visual_elements, cultural_motifs
          FROM regional_themes
          WHERE is_active = true
          ORDER BY RANDOM()
          LIMIT 1
        `,
        sql`
          SELECT name, primary_gradient, accent_colors
          FROM color_schemes
          WHERE is_active = true
          ORDER BY RANDOM()
          LIMIT 1
        `,
        sql`
          SELECT name, main_style, atmosphere
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
          LIMIT 5
        `
      ]);

      const selectedRegion = regionalTheme[0];
      const selectedColor = colorScheme[0];
      const selectedStyle = stylePreset[0];
      const negativeText = negativePrompts.map(np => np.prompt_text).join(', ').substring(0, 100);

      // XAI ile blog içeriğini analiz edip özel prompt üret
      const apiKey = process.env.XAI_API_KEY;

      if (apiKey) {
        try {
          // Dynamic system prompt using database elements
          const systemPrompt = `You are an expert at creating diverse image prompts for Vertex AI.
Create unique, varied prompts avoiding repetition.

USE THESE RANDOM ELEMENTS (mix creatively):
${selectedRegion ? `Region: ${selectedRegion.region_name} - ${selectedRegion.visual_elements}` : ''}
${selectedColor ? `Colors: ${selectedColor.name} - ${selectedColor.primary_gradient}` : ''}
${selectedStyle ? `Style: ${selectedStyle.main_style} - ${selectedStyle.atmosphere}` : ''}

QUALITY: ultra high quality, sharp focus, 4K resolution, photorealistic
AVOID: ${negativeText || 'text, logos, people'}`;

          const userPrompt = `Create a unique image prompt for:
Title: ${blogPost.title.substring(0, 100)}
Topic: ${blogPost.topic}
Keywords: ${blogPost.keywords?.slice(0, 5).join(', ') || ''}

Be creative and vary the style. Return ONLY the prompt.`;

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
              temperature: 0.85,  // Higher for more variety
              max_tokens: 600
            })
          });

          if (response.ok) {
            const data = await response.json();
            const generatedPrompt = data.choices[0]?.message?.content?.trim();
            if (generatedPrompt) {
              // Use 1200 char limit like vertex-ai-generation.ts
              const limitedPrompt = generatedPrompt.substring(0, 1200);
              console.log(`XAI generated prompt (1200 chars): ${limitedPrompt.substring(0, 150)}...`);
              return `${limitedPrompt}, aspect ratio 16:9`;
            }
          }
        } catch (error) {
          console.error("Error generating prompt with XAI:", error);
        }
      }

      // Enhanced fallback using database elements
      const topicLower = blogPost.topic.toLowerCase();
      let technicalFocus = 'modern engineering system';

      if (topicLower.includes('güneş') || topicLower.includes('solar')) {
        technicalFocus = 'solar panel arrays on Mediterranean rooftop';
      } else if (topicLower.includes('ısı') || topicLower.includes('heat')) {
        technicalFocus = 'heat pump system in elegant setting';
      } else if (topicLower.includes('klima')) {
        technicalFocus = 'climate control system visualization';
      } else if (topicLower.includes('su')) {
        technicalFocus = 'water treatment facility, modern design';
      }

      const fallbackPrompt = `${technicalFocus}, ${selectedStyle?.main_style || 'photorealistic'}, ${selectedRegion?.visual_elements || 'technical background'}, ${selectedColor?.name || 'vibrant'} color scheme, ultra high quality, 4K, sharp focus, aspect ratio 16:9, ${negativeText || 'no text, no logos'}`;

      // Apply 1200 char limit to fallback too
      return fallbackPrompt.substring(0, 1200);
    });

    // Step 2: Vertex AI ile resim üret
    const vertexResponse: VertexAIResponse = await step.run("generate-with-vertex-ai", async () => {
      console.log(`Generating image for blog ID: ${blogId} with Vertex AI`);
      console.log(`Blog title: ${blogPost.title}`);
      console.log(`Prompt: ${finalPrompt}`);

      // Vertex AI için geçici resim üretimi
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

      // Use high-quality model for blog images (better quality, higher cost)
      const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-002`;

      const instances = [
        helpers.toValue({
          prompt: finalPrompt,
        })
      ];

      const parameters = helpers.toValue({
        sampleCount: 1,
        aspectRatio: "16:9",
        sampleImageSize: "2k",  // High quality 2k resolution
        safetySetting: "block_some",
        personGeneration: "dont_allow",
        includeRaiReason: true,
        includeSafetyAttributes: true,
        language: "en"
      });

      const request = {
        endpoint,
        instances: instances as unknown[],
        parameters,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const [response] = await predictionServiceClient.predict(request);

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
      if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
        throw new Error('Vertex AI returned empty or invalid image data');
      }

      // Log image size for debugging
      const imageSizeKB = Math.round(imageBase64.length * 0.75 / 1024);
      console.log(`Generated image size: ${imageSizeKB} KB`);

      // Check if image is too large (over 5MB)
      if (imageSizeKB > 5120) {
        console.warn(`Image size (${imageSizeKB} KB) exceeds 5MB, may cause rendering issues`);
      }

      // Base64'i data URL'e çevir (Cloudinary upload için)
      const dataUrl = `data:image/png;base64,${imageBase64}`;

      // Fal.ai response formatına benzer bir yapı döndür
      // Limit prompt in response to prevent oversized outputs
      return {
        images: [{
          url: dataUrl,
          width: 2048,  // 2K resolution width
          height: 1152,  // 16:9 aspect ratio for 2K
          content_type: 'image/png'
        }],
        prompt: finalPrompt.substring(0, 250)  // Limit prompt size in response
      };
    });

    // Step 3: Cloudinary'ye yükle
    const uploadedImage = await step.run("upload-to-cloudinary", async () => {
      const image = vertexResponse.images[0];
      if (!image) {
        throw new Error('No image generated by Vertex AI');
      }

      try {
        const cloudinaryResult = await uploadToCloudinary(image.url, `Blog: ${blogPost.title} - ${finalPrompt}`);
        return {
          originalUrl: image.url,
          cloudinaryUrl: cloudinaryResult.url,
          cloudinaryPublicId: cloudinaryResult.publicId,
          width: image.width,
          height: image.height
        };
      } catch (error) {
        console.error('Failed to upload blog image to Cloudinary:', error);
        throw error;
      }
    });

    // Step 4: Blog kaydını güncelle
    await step.run("update-blog-with-image", async () => {
      await sql`
        UPDATE generated_content
        SET
          image_url = ${uploadedImage.cloudinaryUrl},
          image_prompt = ${finalPrompt},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${blogId}
      `;

      // Güncellenmiş blog kaydını getir
      const result = await sql`
        SELECT id, title, image_url, image_prompt, updated_at
        FROM generated_content
        WHERE id = ${blogId}
      `;
      
      return result[0];
    });

    // Step 5: Generated_images tablosuna da kaydet (backup/tracking için)
    await step.run("save-to-generated-images", async () => {
      await sql`
        INSERT INTO generated_images (
          original_prompt,
          enhanced_prompt,
          brand_id,
          size,
          style,
          status,
          cloudinary_url,
          cloudinary_public_id,
          metadata,
          created_at
        ) VALUES (
          ${finalPrompt},
          ${`Blog image for: ${blogPost.title}`},
          ${null}, -- Blog'lar için brand_id yok
          ${`${uploadedImage.width}x${uploadedImage.height}`},
          ${'blog-image'},
          ${'completed'},
          ${uploadedImage.cloudinaryUrl},
          ${uploadedImage.cloudinaryPublicId},
          ${JSON.stringify({
            blogId: blogId,
            blogTitle: blogPost.title,
            model: 'vertex-ai/imagen-3.0',
            vertex_ai_url: uploadedImage.originalUrl,
            aspect_ratio: '16:9',
            safety_setting: 'block_some',
            generated_with: 'vertex-ai'
          })},
          ${new Date().toISOString()}
        )
      `;
    });

    // Step 6: Event log kaydet
    await step.run("log-event", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'blog.image.generated',
          'blog_image_generation',
          'success',
          ${JSON.stringify({
            blogId: blogId,
            blogTitle: blogPost.title,
            prompt: finalPrompt,
            imageUrl: uploadedImage.cloudinaryUrl
          })},
          ${JSON.stringify({
            model: 'vertex-ai/imagen-3.0',
            imageSize: '16:9',
            generatedWith: 'vertex-ai',
            cloudinaryPublicId: uploadedImage.cloudinaryPublicId
          })}
        )
      `;
    });

    return {
      success: true,
      blogId: blogId,
      blogTitle: blogPost.title,
      imageUrl: uploadedImage.cloudinaryUrl,
      imagePrompt: finalPrompt,
      model: 'vertex-ai/imagen-3.0',
      generatedWith: 'vertex-ai',
      message: `Successfully generated and assigned image to blog post using Vertex AI: ${blogPost.title}`
    };
  }
);