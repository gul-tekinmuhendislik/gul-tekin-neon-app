import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  tags?: string[];
  transformation?: Record<string, unknown>[];
  format?: string;
  quality?: string | number;
  width?: number;
  height?: number;
  crop?: string;
  background?: string;
}

export interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: string | number;
  format?: string;
  effect?: string;
  angle?: number;
  overlay?: string;
  underlay?: string;
  background?: string;
  color?: string;
  flags?: string | string[];
  dpr?: string | number;
  fetch_format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
}

// Upload file to Cloudinary
export async function uploadToCloudinary(
  file: string | Buffer,
  options: UploadOptions = {}
): Promise<{
  success: boolean;
  data?: {
    public_id: string;
    url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    bytes: number;
    tags: string[];
  };
  error?: string;
}> {
  try {
    const uploadOptions = {
      folder: options.folder || 'gul-tekin',
      resource_type: options.resource_type || 'auto',
      overwrite: options.overwrite ?? true,
      ...options
    };

    const result = await cloudinary.uploader.upload(
      typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`,
      uploadOptions
    );

    return {
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        created_at: result.created_at,
        bytes: result.bytes,
        tags: result.tags
      }
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(publicId: string, resourceType: string = 'image'): Promise<Record<string, unknown>> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as 'image' | 'video' | 'raw'
    });

    return {
      success: result.result === 'ok',
      data: result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}

// Generate transformation URL
export function getTransformationUrl(
  publicId: string,
  transformations: TransformationOptions = {}
): string {
  const defaultTransformations = {
    fetch_format: 'auto',
    quality: 'auto',
    ...transformations
  };

  return cloudinary.url(publicId, {
    transformation: [defaultTransformations],
    secure: true
  });
}

// Get optimized image URL
export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  height?: number,
  options: TransformationOptions = {}
): string {
  const transformations: TransformationOptions = {
    fetch_format: 'auto',
    quality: 'auto:good',
    ...options
  };

  if (width) transformations.width = width;
  if (height) transformations.height = height;
  if (width || height) transformations.crop = transformations.crop || 'fill';

  return getTransformationUrl(publicId, transformations);
}

// Generate responsive image URLs
export function getResponsiveImageUrls(
  publicId: string,
  breakpoints: number[] = [320, 640, 768, 1024, 1280, 1536],
  options: TransformationOptions = {}
): Record<number, string> {
  const urls: Record<number, string> = {};

  breakpoints.forEach(width => {
    urls[width] = getOptimizedImageUrl(publicId, width, undefined, {
      ...options,
      dpr: 'auto'
    });
  });

  return urls;
}

// Batch upload multiple files
export async function batchUpload(
  files: Array<{ file: string | Buffer; options?: UploadOptions }>,
  concurrency: number = 3
): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = [];
  const chunks: Array<Array<{ file: string | Buffer; options?: UploadOptions }>> = [];

  // Split files into chunks for concurrent processing
  for (let i = 0; i < files.length; i += concurrency) {
    chunks.push(files.slice(i, i + concurrency));
  }

  // Process chunks sequentially, files within chunks concurrently
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(({ file, options }) => uploadToCloudinary(file, options))
    );
    results.push(...chunkResults);
  }

  return results;
}

// Apply AI-based transformations
export function getAITransformationUrl(
  publicId: string,
  aiTransformations: {
    removeBackground?: boolean;
    improveQuality?: boolean;
    upscale?: boolean;
    enhanceFace?: boolean;
    removeRedEye?: boolean;
  } = {},
  additionalOptions: TransformationOptions = {}
): string {
  const transformations: Record<string, unknown> = { ...additionalOptions };

  if (aiTransformations.removeBackground) {
    transformations.effect = 'background_removal';
  }
  if (aiTransformations.improveQuality) {
    transformations.effect = transformations.effect ? `${transformations.effect}:improve` : 'improve';
  }
  if (aiTransformations.upscale) {
    transformations.effect = transformations.effect ? `${transformations.effect}:upscale` : 'upscale';
  }
  if (aiTransformations.enhanceFace) {
    transformations.effect = transformations.effect ? `${transformations.effect}:enhance_face` : 'enhance_face';
  }
  if (aiTransformations.removeRedEye) {
    transformations.effect = transformations.effect ? `${transformations.effect}:redeye` : 'redeye';
  }

  return getTransformationUrl(publicId, transformations);
}

export default cloudinary;