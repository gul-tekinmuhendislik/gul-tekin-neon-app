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
  
  return buildCloudinaryTransformUrl(url, width, height, {
    quality: finalConfig.quality,
    fetch_format: finalConfig.format,
    crop: 'fill',
    gravity: 'auto',
    dpr: 'auto'
  });
}

// Builds a transformed Cloudinary delivery URL by inserting the transformation segment
// after "/upload/". Pure string work, so it is safe in client bundles (the Node
// cloudinary SDK in lib/cloudinary.ts cannot be bundled for the browser).
function buildCloudinaryTransformUrl(
  url: string,
  width: number | undefined,
  height: number | undefined,
  options: { quality?: string | number; fetch_format?: string; crop?: string; gravity?: string; dpr?: string | number }
): string {
  const segments: string[] = [];
  if (width) segments.push(`w_${width}`);
  if (height) segments.push(`h_${height}`);
  if (options.crop) segments.push(`c_${options.crop}`);
  if (options.gravity) segments.push(`g_${options.gravity}`);
  if (options.quality !== undefined) segments.push(`q_${options.quality}`);
  if (options.fetch_format) segments.push(`f_${options.fetch_format}`);
  if (options.dpr !== undefined) segments.push(`dpr_${options.dpr}`);

  const marker = '/upload/';
  const index = url.indexOf(marker);
  if (index === -1 || segments.length === 0) return url;
  const insertAt = index + marker.length;
  return `${url.slice(0, insertAt)}${segments.join(',')}/${url.slice(insertAt)}`;
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