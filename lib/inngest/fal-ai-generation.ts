import { inngest } from "./client";
import { sql } from "@/lib/db";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      
      // Hiç prompt yoksa, XAI ile üret
      console.log(`No prompt found, triggering XAI prompt generation for blog ${blogId}`);
      await inngest.send({
        name: "content/generate-prompt.xai",
        data: {
          contentId: blogId,
          batchProcess: false
        }
      });
      
      // XAI'nin prompt üretmesi için kısa bir süre bekle
      await step.sleep("wait-for-xai-prompt", "10s");
      
      // Güncellenmiş prompt'u al
      const updatedResult = await sql`
        SELECT prompt, image_prompt
        FROM generated_content
        WHERE id = ${blogId}
      `;
      
      if (updatedResult.length > 0) {
        return updatedResult[0].prompt || updatedResult[0].image_prompt || 
          `Modern ${blogPost.topic} installation in Mediterranean villa, professional photography, golden hour`;
      }
      
      // Fallback prompt
      return `Modern ${blogPost.topic} installation in Mediterranean villa, professional photography, golden hour`;
    });

    // Step 2: Fal.ai ile resim üret
    const falResponse = await step.run("generate-with-fal-ai", async () => {
      console.log(`Generating image for blog ID: ${blogId}`);
      console.log(`Blog title: ${blogPost.title}`);
      console.log(`Prompt: ${finalPrompt}`);
      
      return await generateWithFalAI(
        finalPrompt,
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
          prompt = ${finalPrompt},
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
            prompt: finalPrompt,
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
      imagePrompt: finalPrompt,
      model: model,
      inferenceTime: falResponse.timings?.inference,
      message: `Successfully generated and assigned image to blog post: ${blogPost.title}`
    };
  }
);