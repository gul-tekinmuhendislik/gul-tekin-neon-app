/**
 * Image optimization utilities for better Core Web Vitals
 */

export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Generate optimized Cloudinary URL with transformations
 */
export function getOptimizedCloudinaryUrl(
  publicId: string,
  config: ImageOptimizationConfig = {}
): string {
  const {
    quality = 80,
    format = 'auto',
    width,
    height,
  } = config;

  const baseUrl = 'https://res.cloudinary.com/dcvjjbtyp/image/upload';
  const transformations = [];

  // Quality optimization
  transformations.push(`q_${quality}`);

  // Format optimization (auto-select best format)
  transformations.push(`f_${format}`);

  // Resize if dimensions provided
  if (width || height) {
    const resizeParams = [];
    if (width) resizeParams.push(`w_${width}`);
    if (height) resizeParams.push(`h_${height}`);
    transformations.push(`c_fit,${resizeParams.join(',')}`);
  }

  // Additional optimizations
  transformations.push('c_pad'); // Pad to exact dimensions if needed
  transformations.push('g_center'); // Center gravity for cropping

  return `${baseUrl}/${transformations.join(',')}/${publicId}`;
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(publicId: string): {
  mobile: string;
  tablet: string;
  desktop: string;
  original: string;
} {
  return {
    mobile: getOptimizedCloudinaryUrl(publicId, { width: 640, quality: 75 }),
    tablet: getOptimizedCloudinaryUrl(publicId, { width: 1024, quality: 80 }),
    desktop: getOptimizedCloudinaryUrl(publicId, { width: 1920, quality: 85 }),
    original: getOptimizedCloudinaryUrl(publicId, { quality: 90 }),
  };
}

/**
 * Validate alt text and provide fallbacks
 */
export function validateAltText(
  altText: string | undefined,
  fileName: string,
  context?: string
): string {
  if (altText && altText.trim().length > 0) {
    // Ensure alt text doesn't exceed recommended length (125 characters)
    return altText.length > 125 ? altText.substring(0, 122) + '...' : altText;
  }

  // Generate descriptive alt text from filename and context
  const cleanFileName = fileName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ')     // Replace hyphens and underscores with spaces
    .replace(/\d+/g, '')       // Remove numbers
    .trim();

  if (context) {
    return `${context} - ${cleanFileName}`.substring(0, 125);
  }

  return cleanFileName || 'Görsel';
}

/**
 * Check if image should be loaded with priority
 */
export function shouldUsePriority(
  imageIndex: number,
  isAboveFold: boolean = false
): boolean {
  // Only first 2-3 images above the fold should have priority
  return isAboveFold && imageIndex < 3;
}

/**
 * Generate image sizes string for responsive images
 */
export function getImageSizes(
  breakpoints: { mobile?: number; tablet?: number; desktop?: number } = {}
): string {
  const {
    mobile = 100,
    tablet = 50,
    desktop = 33
  } = breakpoints;

  return `(max-width: 768px) ${mobile}vw, (max-width: 1200px) ${tablet}vw, ${desktop}vw`;
}

/**
 * Convert large local images to optimized format recommendations
 */
export function getLargeImageRecommendations(filePath: string, fileSizeKB: number): {
  shouldOptimize: boolean;
  recommendations: string[];
  cloudinaryMigration?: string;
} {
  const recommendations: string[] = [];
  const shouldOptimize = fileSizeKB > 500; // Images over 500KB

  if (shouldOptimize) {
    recommendations.push('Resmi Cloudinary\'a yükleyin ve otomatik optimizasyon kullanın');
    recommendations.push('WebP/AVIF formatlarını destekleyin');
    recommendations.push('Responsive image boyutları kullanın');

    if (fileSizeKB > 1000) {
      recommendations.push('KRITIK: Resim 1MB\'dan büyük - öncelikle optimize edin');
    }
  }

  // Extract potential public ID from filename for Cloudinary migration
  const fileName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '');
  const cloudinaryMigration = fileName
    ? `getOptimizedCloudinaryUrl('${fileName}', { quality: 80 })`
    : undefined;

  return {
    shouldOptimize,
    recommendations,
    cloudinaryMigration
  };
}