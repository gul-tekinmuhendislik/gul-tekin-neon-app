import { inngest } from "./client";
import { sql } from "@/lib/db";
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
      folder: 'fal-ai-generated',
      public_id: `fal-ai-${Date.now()}`,
      tags: ['ai-generated', 'fal-ai'],
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
    const blogPost = await step.run("check-blog-post", async () => {
      const result = await sql`
        SELECT id, title, topic, content, status, prompt, image_prompt
        FROM generated_content
        WHERE id = ${blogId}
      `;
      
      if (result.length === 0) {
        throw new Error(`Blog post with ID ${blogId} not found`);
      }
      
      return result[0];
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

      // Hiç prompt yoksa, topic bazlı prompt üret (XAI kullanmadan)
      console.log(`No prompt found, generating topic-based prompt for blog ${blogId}`);

      // Topic bazlı Mediterranean Turkish architecture prompt
      const topicPrompts: Record<string, string> = {
        "Isı Pompası": "heat pump system with Mediterranean Turkish villa, traditional Muğla red clay roof tiles, stone chimneys, olive grove background",
        "Güneş Enerjisi": "solar panels on traditional Turkish rooftop with red clay tiles, Bodrum white cubic architecture, olive trees, bougainvillea",
        "Klima Sistemleri": "VRF system on Mediterranean building with stone walls, Turkish clay roof tiles, olive groves, bougainvillea accents",
        "Su Arıtma": "water treatment system with Turkish stone architecture, Mediterranean garden setting, traditional chimneys",
        "Havuz Sistemleri": "pool system with Bodrum white stone walls, Mediterranean tiles, bougainvillea cascading, olive landscape",
        "Mekanik Tesisat": "mechanical systems with traditional Muğla architecture, red clay tiles, stone chimney details"
      };

      // Generate prompt based on topic or use fallback
      return topicPrompts[blogPost.topic] ||
        `Modern ${blogPost.topic} installation in Mediterranean Turkish villa, Muğla red clay roof tiles, stone chimneys, olive groves, purple bougainvillea, professional photography`;
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

      const endpoint = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-001`;

      const instances = [
        helpers.toValue({
          prompt: finalPrompt,
        })
      ];

      const parameters = helpers.toValue({
        sampleCount: 1,
        aspectRatio: "16:9",
        sampleImageSize: "2k", // Upgraded from default 1k to 2k for better quality
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

      // Base64'i data URL'e çevir (Cloudinary upload için)
      const dataUrl = `data:image/png;base64,${imageBase64}`;

      // Fal.ai response formatına benzer bir yapı döndür
      return {
        images: [{
          url: dataUrl,
          width: 2048,  // 2K resolution width
          height: 1152,  // 16:9 aspect ratio for 2K
          content_type: 'image/png'
        }],
        prompt: finalPrompt
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