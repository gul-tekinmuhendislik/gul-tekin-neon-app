import { inngest } from "./client";
import { sql } from "../db";
import * as fal from "@fal-ai/serverless-client";
import { v2 as cloudinary } from "cloudinary";

// Fal.ai configuration
fal.config({
  credentials: process.env.FAL_KEY!,
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface FalImageResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings: {
    inference: number;
  };
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
}

interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
  api_key: string;
}

async function generateImageWithFal(prompt: string, negativePrompt?: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt: prompt,
      negative_prompt: negativePrompt || "low quality, blurry, text, watermark",
      image_size: "landscape_16_9",
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        console.log("Image generation in progress...");
      }
    },
  }) as FalImageResponse;

  if (!result.images || result.images.length === 0) {
    throw new Error("No image generated from Fal.ai");
  }

  return result.images[0].url;
}

async function uploadToCloudinary(imageUrl: string, publicId: string): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imageUrl,
      {
        public_id: publicId,
        folder: "generated-content",
        resource_type: "image",
        overwrite: true,
        transformation: [
          { width: 1920, height: 1080, crop: "fill", gravity: "center" },
          { quality: "auto:best" },
          { fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as unknown as CloudinaryUploadResponse);
        }
      }
    );
  });
}

export const generateMissingImages = inngest.createFunction(
  {
    id: "generate-missing-images",
    name: "Generate Images for Content Without Images",
    retries: 2,
    concurrency: {
      limit: 3,
    }
  },
  { event: "images/generate.missing" },
  async ({ event, step }) => {
    const { contentId, batchProcess = false, limit = 5 } = event.data;

    // Step 1: Fetch content(s) without images
    const contents = await step.run("fetch-contents-without-images", async () => {
      if (contentId) {
        // Process specific content
        const results = await sql`
          SELECT id, topic, title, prompt, keywords, slug,
                 metadata->>'negativePrompt' as negative_prompt
          FROM generated_content
          WHERE id = ${contentId}
            AND prompt IS NOT NULL
            AND (image_url IS NULL OR image_url = '')
        `;
        return results;
      } else if (batchProcess) {
        // Process batch
        const results = await sql`
          SELECT id, topic, title, prompt, keywords, slug,
                 metadata->>'negativePrompt' as negative_prompt
          FROM generated_content
          WHERE prompt IS NOT NULL
            AND (image_url IS NULL OR image_url = '')
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
        return results;
      } else {
        // Process single
        const results = await sql`
          SELECT id, topic, title, prompt, keywords, slug,
                 metadata->>'negativePrompt' as negative_prompt
          FROM generated_content
          WHERE prompt IS NOT NULL
            AND (image_url IS NULL OR image_url = '')
          ORDER BY created_at DESC
          LIMIT 1
        `;
        return results;
      }
    });

    if (contents.length === 0) {
      return {
        success: false,
        message: "No content found that needs image generation"
      };
    }

    // Step 2: Generate and upload images for each content
    const processedImages = await step.run("generate-and-upload-images", async () => {
      const results = [];
      
      for (const content of contents) {
        try {
          // Generate image with Fal.ai
          console.log(`Generating image for content ID: ${content.id}`);
          const imageUrl = await generateImageWithFal(
            content.prompt,
            content.negative_prompt
          );

          // Upload to Cloudinary
          const publicId = `blog-${content.slug || content.id}-${Date.now()}`;
          console.log(`Uploading to Cloudinary with public_id: ${publicId}`);
          const cloudinaryResult = await uploadToCloudinary(imageUrl, publicId);

          results.push({
            contentId: content.id,
            imageUrl: cloudinaryResult.secure_url,
            cloudinaryPublicId: cloudinaryResult.public_id,
            success: true
          });
        } catch (error) {
          console.error(`Failed to generate image for content ${content.id}:`, error);
          results.push({
            contentId: content.id,
            error: error instanceof Error ? error.message : "Unknown error",
            success: false
          });
        }
      }
      
      return results;
    });

    // Step 3: Update database with generated images
    const updated = await step.run("update-database-with-images", async () => {
      const successfulUpdates = [];
      
      for (const result of processedImages) {
        if (result.success && 'imageUrl' in result) {
          await sql`
            UPDATE generated_content
            SET 
              image_url = ${result.imageUrl},
              metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({ 
                imageGeneratedAt: new Date().toISOString(),
                imageGenerator: 'fal-ai',
                imageModel: 'flux-schnell',
                cloudinaryPublicId: result.cloudinaryPublicId
              })}::jsonb,
              updated_at = NOW()
            WHERE id = ${result.contentId}
          `;
          
          successfulUpdates.push({
            contentId: result.contentId,
            imageUrl: result.imageUrl
          });
        }
      }
      
      return successfulUpdates;
    });

    // Step 4: Log event
    await step.run("log-image-generation", async () => {
      await sql`
        INSERT INTO event_logs (name, data)
        VALUES (
          'images_generated_batch',
          ${JSON.stringify({
            totalProcessed: processedImages.length,
            successful: updated.length,
            failed: processedImages.length - updated.length,
            contentIds: updated.map(u => u.contentId),
            batchProcess: batchProcess
          })}::jsonb
        )
      `;
    });

    return {
      success: true,
      totalProcessed: processedImages.length,
      successfulGenerations: updated.length,
      failedGenerations: processedImages.length - updated.length,
      generatedImages: updated,
      message: `Successfully generated ${updated.length} out of ${processedImages.length} images`
    };
  }
);

// Scheduled function to process missing images periodically
export const scheduledImageGeneration = inngest.createFunction(
  {
    id: "scheduled-image-generation",
    name: "Scheduled Image Generation for Missing Images",
  },
  { cron: "0 */6 * * *" }, // Run every 6 hours
  async ({ step }) => {
    // Step 1: Check for contents without images
    const pendingCount = await step.run("check-pending-images", async () => {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM generated_content
        WHERE prompt IS NOT NULL
          AND (image_url IS NULL OR image_url = '')
      `;
      return result[0].count;
    });

    if (pendingCount === 0) {
      return {
        success: true,
        message: "No pending images to generate"
      };
    }

    // Step 2: Trigger batch processing
    await step.run("trigger-batch-processing", async () => {
      await inngest.send({
        name: "images/generate.missing",
        data: {
          batchProcess: true,
          limit: 10 // Process 10 at a time
        }
      });
    });

    return {
      success: true,
      pendingCount: pendingCount,
      message: `Triggered batch processing for ${Math.min(10, pendingCount)} images`
    };
  }
);

// Function to regenerate a specific image
export const regenerateImage = inngest.createFunction(
  {
    id: "regenerate-image",
    name: "Regenerate Image for Specific Content",
    retries: 2
  },
  { event: "image/regenerate" },
  async ({ event, step }) => {
    const { contentId, newPrompt } = event.data;

    // Step 1: Fetch content
    const content = await step.run("fetch-content", async () => {
      const result = await sql`
        SELECT id, topic, title, prompt, slug, image_url,
               metadata->>'cloudinaryPublicId' as cloudinary_public_id,
               metadata->>'negativePrompt' as negative_prompt
        FROM generated_content
        WHERE id = ${contentId}
      `;
      
      if (result.length === 0) {
        throw new Error(`Content not found with ID: ${contentId}`);
      }
      
      return result[0];
    });

    // Step 2: Delete old image from Cloudinary if exists
    if (content.cloudinary_public_id) {
      await step.run("delete-old-image", async () => {
        try {
          await cloudinary.uploader.destroy(content.cloudinary_public_id);
        } catch (error) {
          console.log("Could not delete old image:", error);
        }
      });
    }

    // Step 3: Generate new image
    const newImage = await step.run("generate-new-image", async () => {
      const promptToUse = newPrompt || content.prompt;
      
      if (!promptToUse) {
        throw new Error("No prompt available for image generation");
      }

      const imageUrl = await generateImageWithFal(
        promptToUse,
        content.negative_prompt
      );

      const publicId = `blog-${content.slug || content.id}-${Date.now()}`;
      const cloudinaryResult = await uploadToCloudinary(imageUrl, publicId);

      return {
        imageUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id
      };
    });

    // Step 4: Update database
    await step.run("update-database", async () => {
      await sql`
        UPDATE generated_content
        SET 
          image_url = ${newImage.imageUrl},
          ${newPrompt ? sql`prompt = ${newPrompt},` : sql``}
          metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({ 
            imageRegeneratedAt: new Date().toISOString(),
            imageGenerator: 'fal-ai',
            imageModel: 'flux-schnell',
            cloudinaryPublicId: newImage.cloudinaryPublicId,
            previousImageUrl: content.image_url
          })}::jsonb,
          updated_at = NOW()
        WHERE id = ${contentId}
      `;
    });

    return {
      success: true,
      contentId: contentId,
      newImageUrl: newImage.imageUrl,
      message: "Image regenerated successfully"
    };
  }
);