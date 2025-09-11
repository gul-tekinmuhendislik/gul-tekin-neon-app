import { inngest } from "./client";
import { sql } from "@/lib/db";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface FalAIGenerationRequest {
  prompt: string;
  brandId?: string;
  model?: string;
  imageSize?: string;
  numInferenceSteps?: number;
  guidanceScale?: number;
  numImages?: number;
  enableSafetyChecker?: boolean;
}

interface FalAIResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings?: {
    inference: number;
  };
  seed?: number;
  has_nsfw_concepts?: boolean[];
  prompt: string;
}

// Fal.ai ile resim üretme
async function generateWithFalAI(
  prompt: string,
  model: string = "fal-ai/imagen4/preview/fast", // Varsayılan olarak uygun fiyatlı model
  imageSize: string = "landscape_16_9",
  numInferenceSteps: number = 4,
  guidanceScale: number = 7.5,
  numImages: number = 1,
  enableSafetyChecker: boolean = true
): Promise<FalAIResponse> {
  const apiKey = process.env.FAL_AI_KEY;
  if (!apiKey) {
    throw new Error("FAL_AI_KEY environment variable is not set");
  }

  try {
    // Fal.ai API endpoint
    const apiUrl = `https://fal.run/${model}`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        image_size: imageSize,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
        num_images: numImages,
        enable_safety_checker: enableSafetyChecker,
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Fal.ai API error: ${response.status} - ${error}`);
    }

    const data: FalAIResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating image with Fal.ai:", error);
    throw error;
  }
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

// Inngest fonksiyonu - Fal.ai ile resim üretme
export const generateImageWithFalAI = inngest.createFunction(
  { 
    id: "generate-image-fal-ai",
    name: "Generate Image with Fal.ai",
    retries: 2
  },
  { event: "image/fal-ai.generate.requested" },
  async ({ event, step }) => {
    const { 
      prompt, 
      brandId, 
      model = "fal-ai/imagen4/preview/fast", // Varsayılan olarak uygun fiyatlı model
      imageSize = "landscape_16_9",
      numInferenceSteps = 4,
      guidanceScale = 7.5,
      numImages = 1,
      enableSafetyChecker = true
    } = event.data as FalAIGenerationRequest;

    // Step 1: Fal.ai ile resim üret
    const falResponse = await step.run("generate-with-fal-ai", async () => {
      console.log(`Generating image with Fal.ai model: ${model}`);
      console.log(`Prompt: ${prompt}`);
      
      return await generateWithFalAI(
        prompt,
        model,
        imageSize,
        numInferenceSteps,
        guidanceScale,
        numImages,
        enableSafetyChecker
      );
    });

    // Step 2: Üretilen görselleri Cloudinary'ye yükle
    const uploadedImages = await step.run("upload-to-cloudinary", async () => {
      const uploads = [];
      
      for (const image of falResponse.images) {
        try {
          const cloudinaryResult = await uploadToCloudinary(image.url, prompt);
          uploads.push({
            originalUrl: image.url,
            cloudinaryUrl: cloudinaryResult.url,
            cloudinaryPublicId: cloudinaryResult.publicId,
            width: image.width,
            height: image.height
          });
        } catch (error) {
          console.error('Failed to upload image to Cloudinary:', error);
          uploads.push({
            originalUrl: image.url,
            cloudinaryUrl: null,
            cloudinaryPublicId: null,
            width: image.width,
            height: image.height,
            error: 'Cloudinary upload failed'
          });
        }
      }
      
      return uploads;
    });

    // Step 3: Veritabanına kaydet
    const savedImages = await step.run("save-to-database", async () => {
      const savedRecords = [];
      
      for (const image of uploadedImages) {
        const result = await sql`
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
            ${prompt},
            ${prompt}, -- Fal.ai doesn't enhance prompts
            ${brandId || null},
            ${`${image.width}x${image.height}`},
            ${model},
            ${image.cloudinaryUrl ? 'completed' : 'partial'},
            ${image.cloudinaryUrl || image.originalUrl},
            ${image.cloudinaryPublicId || null},
            ${JSON.stringify({
              model: model,
              fal_ai_url: image.originalUrl,
              inference_steps: numInferenceSteps,
              guidance_scale: guidanceScale,
              seed: falResponse.seed,
              inference_time: falResponse.timings?.inference,
              has_nsfw: falResponse.has_nsfw_concepts?.[0] || false
            })},
            ${new Date().toISOString()}
          )
          RETURNING id, original_prompt, cloudinary_url, created_at
        `;
        
        savedRecords.push(result[0]);
      }
      
      return savedRecords;
    });

    // Step 4: Event log kaydet
    await step.run("log-event", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'image.fal-ai.generated',
          'ai_generation',
          'success',
          ${JSON.stringify({
            prompt: prompt,
            imageCount: savedImages.length,
            imageIds: savedImages.map(img => img.id)
          })},
          ${JSON.stringify({
            brandId,
            model,
            imageSize,
            numInferenceSteps,
            guidanceScale,
            inferenceTime: falResponse.timings?.inference,
            seed: falResponse.seed
          })}
        )
      `;
    });

    return {
      success: true,
      images: savedImages,
      model: model,
      inferenceTime: falResponse.timings?.inference,
      message: `Successfully generated ${savedImages.length} image(s) with Fal.ai`
    };
  }
);

// Blog için resim üretme - Fal.ai
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
      prompt, 
      model = "fal-ai/imagen4/preview/fast",
      imageSize = "landscape_16_9",
      numInferenceSteps = 4,
      guidanceScale = 7.5
    } = event.data as {
      blogId: number;
      prompt: string;
      model?: string;
      imageSize?: string;
      numInferenceSteps?: number;
      guidanceScale?: number;
    };

    // Step 1: Blog kaydını kontrol et
    const blogPost = await step.run("check-blog-post", async () => {
      const result = await sql`
        SELECT id, title, topic, content, status
        FROM generated_content
        WHERE id = ${blogId}
      `;
      
      if (result.length === 0) {
        throw new Error(`Blog post with ID ${blogId} not found`);
      }
      
      return result[0];
    });

    // Step 2: Fal.ai ile resim üret
    const falResponse = await step.run("generate-with-fal-ai", async () => {
      console.log(`Generating image for blog ID: ${blogId}`);
      console.log(`Blog title: ${blogPost.title}`);
      console.log(`Prompt: ${prompt}`);
      
      return await generateWithFalAI(
        prompt,
        model,
        imageSize,
        numInferenceSteps,
        guidanceScale,
        1, // Blog için tek resim
        true // Safety checker aktif
      );
    });

    // Step 3: Cloudinary'ye yükle
    const uploadedImage = await step.run("upload-to-cloudinary", async () => {
      const image = falResponse.images[0];
      if (!image) {
        throw new Error('No image generated by Fal.ai');
      }

      try {
        const cloudinaryResult = await uploadToCloudinary(image.url, `Blog: ${blogPost.title} - ${prompt}`);
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
          image_prompt = ${prompt},
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
          ${prompt},
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
            model: model,
            fal_ai_url: uploadedImage.originalUrl,
            inference_steps: numInferenceSteps,
            guidance_scale: guidanceScale,
            seed: falResponse.seed,
            inference_time: falResponse.timings?.inference,
            has_nsfw: falResponse.has_nsfw_concepts?.[0] || false
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
            prompt: prompt,
            imageUrl: uploadedImage.cloudinaryUrl
          })},
          ${JSON.stringify({
            model,
            imageSize,
            numInferenceSteps,
            guidanceScale,
            inferenceTime: falResponse.timings?.inference,
            seed: falResponse.seed,
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
      imagePrompt: prompt,
      model: model,
      inferenceTime: falResponse.timings?.inference,
      message: `Successfully generated and assigned image to blog post: ${blogPost.title}`
    };
  }
);

// Toplu resim üretme - Fal.ai
export const generateBulkImagesWithFalAI = inngest.createFunction(
  { 
    id: "generate-bulk-images-fal-ai",
    name: "Generate Multiple Images with Fal.ai"
  },
  { event: "image/fal-ai.bulk-generate.requested" },
  async ({ event, step }) => {
    const { prompts, model = "fal-ai/flux/schnell" } = event.data as { prompts: string[], model?: string };
    
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const result = await step.run(`generate-image-${i}`, async () => {
        await inngest.send({
          name: "image/fal-ai.generate.requested",
          data: {
            prompt: prompts[i],
            model: model
          }
        });
        
        return {
          prompt: prompts[i],
          status: "queued"
        };
      });
      
      results.push(result);
    }
    
    return {
      success: true,
      totalQueued: results.length,
      results
    };
  }
);