import { getOptimizedImageUrl } from '@/lib/cloudinary';

export interface ImageOptimizationConfig {
  quality?: 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'avif';
  sizes?: {
    mobile?: { width: number; height?: number };
    tablet?: { width: number; height?: number };
    desktop?: { width: number; height?: number };
  };
}

const DEFAULT_CONFIG: ImageOptimizationConfig = {
  quality: 'auto:good',
  format: 'auto',
  sizes: {
    mobile: { width: 640 },
    tablet: { width: 1024 },
    desktop: { width: 1920 }
  }
};

export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary')) return null;
  
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Skip version if present (starts with 'v' followed by digits)
    let startIndex = uploadIndex + 1;
    if (urlParts[startIndex] && urlParts[startIndex].match(/^v\d+$/)) {
      startIndex++;
    }
    
    // Join remaining parts without file extension
    const publicIdParts = urlParts.slice(startIndex);
    const lastPart = publicIdParts[publicIdParts.length - 1];
    const withoutExtension = lastPart.replace(/\.[^/.]+$/, '');
    publicIdParts[publicIdParts.length - 1] = withoutExtension;
    
    return publicIdParts.join('/');
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error);
    return null;
  }
}

export function getOptimizedUrl(
  url: string | undefined | null,
  width?: number,
  height?: number,
  config: ImageOptimizationConfig = DEFAULT_CONFIG
): string {
  if (!url) return '/placeholder.jpg';
  
  // If it's not a Cloudinary URL, return as is
  if (!url.includes('cloudinary')) return url;
  
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return url;
  
  // Merge config with defaults
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return getOptimizedImageUrl(publicId, width, height, {
    quality: finalConfig.quality,
    fetch_format: finalConfig.format,
    crop: 'fill',
    gravity: 'auto',
    dpr: 'auto'
  });
}

export function getResponsiveSrcSet(
  url: string | undefined | null,
  config: ImageOptimizationConfig = DEFAULT_CONFIG
): string {
  if (!url || !url.includes('cloudinary')) return '';
  
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return '';
  
  const sizes = config.sizes || DEFAULT_CONFIG.sizes;
  const srcSetParts: string[] = [];
  
  if (sizes?.mobile) {
    const mobileUrl = getOptimizedUrl(url, sizes.mobile.width, sizes.mobile.height, config);
    srcSetParts.push(`${mobileUrl} ${sizes.mobile.width}w`);
  }
  
  if (sizes?.tablet) {
    const tabletUrl = getOptimizedUrl(url, sizes.tablet.width, sizes.tablet.height, config);
    srcSetParts.push(`${tabletUrl} ${sizes.tablet.width}w`);
  }
  
  if (sizes?.desktop) {
    const desktopUrl = getOptimizedUrl(url, sizes.desktop.width, sizes.desktop.height, config);
    srcSetParts.push(`${desktopUrl} ${sizes.desktop.width}w`);
  }
  
  return srcSetParts.join(', ');
}

export function getListingImageUrl(url: string | undefined | null): string {
  return getOptimizedUrl(url, 400, 400, {
    quality: 'auto:eco',
    format: 'auto'
  });
}

export function getDetailImageUrl(url: string | undefined | null): string {
  return getOptimizedUrl(url, 1200, 800, {
    quality: 'auto:good',
    format: 'auto'
  });
}

export function getThumbnailUrl(url: string | undefined | null): string {
  return getOptimizedUrl(url, 200, 200, {
    quality: 'auto:low',
    format: 'auto'
  });
}