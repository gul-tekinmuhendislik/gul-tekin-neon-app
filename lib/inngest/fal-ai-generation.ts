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
    }

    const blogPost = await step.run("check-blog-post", async (): Promise<BlogPost> => {
      const result = await sql`
        SELECT id, title, topic, content, status, prompt, image_prompt
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

      // Hiç prompt yoksa, XAI ile dinamik prompt üret
      console.log(`No prompt found, generating dynamic prompt with XAI for blog ${blogId}`);

      // XAI ile blog içeriğini analiz edip özel prompt üret
      const apiKey = process.env.XAI_API_KEY;
      if (!apiKey) {
        // XAI yoksa fallback prompt kullan
        console.log("XAI API key not found, using fallback prompt");
        return `Modern ${blogPost.topic} installation in Mediterranean Turkish villa, Muğla red clay roof tiles, stone chimneys, olive groves, purple bougainvillea, professional photography`;
      }

      try {
        const systemPrompt = `You are an expert at creating image generation prompts for Vertex AI Imagen.
Your task is to create a detailed, photorealistic prompt for blog post images.

IMPORTANT STYLE ELEMENTS TO INCLUDE:
- Mediterranean Turkish architecture (Bodrum/Muğla region)
- Traditional Muğla red clay roof tiles
- Stone chimneys and white stone walls
- Olive groves and purple bougainvillea
- Natural Mediterranean lighting
- Professional architectural photography style
- Technical engineering aesthetics

AVOID:
- Modern city backgrounds
- Concrete blocks or industrial zones
- Northern European architecture
- Pine trees or lavender fields
- Cartoon or illustration styles
- People, text, watermarks, logos`;

        const userPrompt = `Create a concise image prompt for this blog post:
Title: ${blogPost.title.substring(0, 100)}
Topic: ${blogPost.topic.substring(0, 50)}

Generate a brief, focused prompt (max 100 words) with Mediterranean Turkish elements.
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
            max_tokens: 120
          })
        });

        if (response.ok) {
          const data = await response.json();
          const generatedPrompt = data.choices[0]?.message?.content?.trim();
          if (generatedPrompt) {
            // Limit prompt to 250 characters to prevent oversized outputs
            const limitedPrompt = generatedPrompt.substring(0, 250);
            console.log(`XAI generated prompt (limited): ${limitedPrompt.substring(0, 100)}...`);
            return limitedPrompt;
          }
        }
      } catch (error) {
        console.error("Error generating prompt with XAI:", error);
      }

      // Fallback prompt if XAI fails
      return `Modern ${blogPost.topic} installation in Mediterranean Turkish villa, Muğla red clay roof tiles, stone chimneys, olive groves, purple bougainvillea, professional photography`;
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
        sampleImageSize: "1k",  // Reduced from 2k to 1k to prevent oversized outputs
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