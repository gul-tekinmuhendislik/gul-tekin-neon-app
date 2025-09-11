import { inngest } from "./client";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  batchUpload,
  getAITransformationUrl,
  type UploadOptions,
  type TransformationOptions
} from "@/lib/cloudinary";

// Cloudinary Upload Function
export const cloudinaryUpload = inngest.createFunction(
  {
    id: "cloudinary-upload",
    name: "Upload to Cloudinary",
    retries: 3,
  },
  { event: "cloudinary/upload" },
  async ({ event, step }) => {
    const { file, options, batch } = event.data as {
      file?: string | Buffer;
      options?: UploadOptions;
      batch?: Array<{ file: string | Buffer; options?: UploadOptions }>;
    };

    // Handle batch upload
    if (batch && batch.length > 0) {
      const results = await step.run("batch-upload", async () => {
        return await batchUpload(batch, 5);
      });

      await step.run("log-batch-results", async () => {
        console.log(`Batch upload completed: ${results.filter(r => r.success).length}/${batch.length} successful`);
      });

      return {
        type: "batch",
        total: batch.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    }

    // Handle single file upload
    if (!file) {
      throw new Error("No file provided for upload");
    }

    const uploadResult = await step.run("upload-file", async () => {
      return await uploadToCloudinary(file, options);
    });

    if (!uploadResult.success || !uploadResult.data) {
      throw new Error(`Upload failed: ${uploadResult.error}`);
    }

    // Generate responsive URLs if it's an image
    let responsiveUrls = {};
    if (uploadResult.data.resource_type === 'image') {
      responsiveUrls = await step.run("generate-responsive-urls", async () => {
        if (!uploadResult.data) {
          throw new Error("No upload data available for responsive URLs");
        }
        return getResponsiveImageUrls(uploadResult.data.public_id);
      });
    }

    await step.run("log-upload", async () => {
      if (!uploadResult.data) {
        throw new Error("No upload data available for logging");
      }
      console.log(`File uploaded successfully: ${uploadResult.data.public_id}`);
    });

    return {
      type: "single",
      ...uploadResult,
      responsiveUrls
    };
  }
);

// Cloudinary Transform Function
export const cloudinaryTransform = inngest.createFunction(
  {
    id: "cloudinary-transform",
    name: "Transform Cloudinary Asset",
    retries: 2,
  },
  { event: "cloudinary/transform" },
  async ({ event, step }) => {
    const { 
      publicId, 
      transformations,
      generateResponsive,
      aiTransformations
    } = event.data as {
      publicId: string;
      transformations?: TransformationOptions;
      generateResponsive?: boolean;
      aiTransformations?: {
        removeBackground?: boolean;
        improveQuality?: boolean;
        upscale?: boolean;
        enhanceFace?: boolean;
        removeRedEye?: boolean;
      };
    };

    if (!publicId) {
      throw new Error("No publicId provided for transformation");
    }

    const results: {
      publicId: string;
      urls: Record<string, unknown>;
    } = {
      publicId,
      urls: {}
    };

    // Generate standard transformation URL
    if (transformations) {
      results.urls.transformed = await step.run("generate-transformation-url", async () => {
        return getOptimizedImageUrl(
          publicId,
          transformations.width,
          transformations.height,
          transformations
        );
      });
    }

    // Generate AI transformation URLs
    if (aiTransformations) {
      results.urls.aiTransformed = await step.run("generate-ai-transformation-url", async () => {
        return getAITransformationUrl(publicId, aiTransformations, transformations || {});
      });
    }

    // Generate responsive URLs if requested
    if (generateResponsive) {
      results.urls.responsive = await step.run("generate-responsive-urls", async () => {
        return getResponsiveImageUrls(publicId, undefined, transformations || {});
      });
    }

    await step.run("log-transformation", async () => {
      console.log(`Transformations generated for: ${publicId}`);
    });

    return results;
  }
);

// Cloudinary Delete Function
export const cloudinaryDelete = inngest.createFunction(
  {
    id: "cloudinary-delete",
    name: "Delete from Cloudinary",
    retries: 2,
  },
  { event: "cloudinary/delete" },
  async ({ event, step }) => {
    const { publicId, resourceType, batch } = event.data as {
      publicId?: string;
      resourceType?: string;
      batch?: Array<{ publicId: string; resourceType?: string }>;
    };

    // Handle batch delete
    if (batch && batch.length > 0) {
      const results = await step.run("batch-delete", async () => {
        return await Promise.all(
          batch.map(item => 
            deleteFromCloudinary(item.publicId, item.resourceType || 'image')
          )
        );
      });

      await step.run("log-batch-delete", async () => {
        console.log(`Batch delete completed: ${results.filter(r => r.success).length}/${batch.length} successful`);
      });

      return {
        type: "batch",
        total: batch.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    }

    // Handle single delete
    if (!publicId) {
      throw new Error("No publicId provided for deletion");
    }

    const deleteResult = await step.run("delete-file", async () => {
      return await deleteFromCloudinary(publicId, resourceType || 'image');
    });

    if (!deleteResult.success) {
      throw new Error(`Delete failed: ${deleteResult.error}`);
    }

    await step.run("log-delete", async () => {
      console.log(`File deleted successfully: ${publicId}`);
    });

    return {
      type: "single",
      ...deleteResult
    };
  }
);

// Cloudinary Optimize Images Function (for existing images)
export const cloudinaryOptimizeExisting = inngest.createFunction(
  {
    id: "cloudinary-optimize-existing",
    name: "Optimize Existing Cloudinary Images",
    retries: 2,
  },
  { event: "cloudinary/optimize-existing" },
  async ({ event, step }) => {
    const { 
      publicIds,
      optimizations = {
        quality: 'auto:good',
        format: 'auto',
        generateResponsive: true
      }
    } = event.data as {
      publicIds: string[];
      optimizations?: {
        quality?: string;
        format?: string;
        generateResponsive?: boolean;
        sizes?: number[];
      };
    };

    if (!publicIds || publicIds.length === 0) {
      throw new Error("No publicIds provided for optimization");
    }

    const results = await step.run("optimize-images", async () => {
      return await Promise.all(
        publicIds.map(async (publicId) => {
          const optimizedUrl = getOptimizedImageUrl(publicId, undefined, undefined, {
            quality: optimizations.quality,
            fetch_format: optimizations.format as 'auto' | 'webp' | 'avif'
          });

          let responsiveUrls = {};
          if (optimizations.generateResponsive) {
            responsiveUrls = getResponsiveImageUrls(
              publicId,
              optimizations.sizes,
              {
                quality: optimizations.quality,
                fetch_format: optimizations.format as 'auto' | 'webp' | 'avif'
              }
            );
          }

          return {
            publicId,
            optimizedUrl,
            responsiveUrls
          };
        })
      );
    });

    await step.run("log-optimization", async () => {
      console.log(`Optimized ${results.length} images`);
    });

    return {
      total: publicIds.length,
      optimized: results
    };
  }
);

// Cloudinary Auto-tag Function (using AI)
export const cloudinaryAutoTag = inngest.createFunction(
  {
    id: "cloudinary-auto-tag",
    name: "Auto-tag Cloudinary Images",
    retries: 2,
  },
  { event: "cloudinary/auto-tag" },
  async ({ event, step }) => {
    const { publicId, options } = event.data as {
      publicId: string;
      options?: {
        categorization?: 'google_tagging' | 'imagga_tagging' | 'aws_rek_tagging';
        detection?: 'google_video_tagging' | 'google_speech_tagging';
      };
    };

    if (!publicId) {
      throw new Error("No publicId provided for auto-tagging");
    }

    // Note: This would require additional Cloudinary add-ons
    // For now, we'll return a placeholder structure
    const tagResult = await step.run("auto-tag", async () => {
      console.log(`Auto-tagging ${publicId} with options:`, options);
      
      // This is where you would call Cloudinary's auto-tagging API
      // when the appropriate add-ons are enabled
      return {
        publicId,
        tags: [],
        message: "Auto-tagging requires Cloudinary add-ons to be enabled"
      };
    });

    return tagResult;
  }
);