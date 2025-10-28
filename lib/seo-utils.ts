/**
 * SEO Utility Functions
 * These utilities help monitor and improve SEO performance
 */

export interface SEOScore {
  score: number;
  issues: string[];
  warnings: string[];
  passed: string[];
}

/**
 * Check if a title is optimized for SEO
 */
export function checkTitleOptimization(title: string): {
  isOptimized: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (title.length < 30) {
    issues.push("Title is too short (< 30 characters)");
  }
  if (title.length > 60) {
    issues.push("Title is too long (> 60 characters)");
  }
  if (title === title.toUpperCase()) {
    issues.push("Title is all uppercase");
  }
  
  return {
    isOptimized: issues.length === 0,
    issues,
  };
}

/**
 * Check if a description is optimized for SEO
 */
export function checkDescriptionOptimization(description: string): {
  isOptimized: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (description.length < 120) {
    issues.push("Description is too short (< 120 characters)");
  }
  if (description.length > 160) {
    issues.push("Description is too long (> 160 characters)");
  }

  return {
    isOptimized: issues.length === 0,
    issues,
  };
}

/**
 * Validate and optimize meta description with intelligent truncation
 */
export function validateMetaDescription(
  description: string | undefined,
  fallback?: string,
  context?: string
): string {
  const IDEAL_LENGTH = 155;
  const MAX_LENGTH = 160;

  if (!description || description.trim().length === 0) {
    if (fallback) {
      return validateMetaDescription(fallback, undefined, context);
    }
    return context ? `${context} hizmetleri hakkında detaylı bilgi alın.` : 'Profesyonel hizmetler.';
  }

  const cleanDescription = description.trim();

  // If description is too long, truncate intelligently
  if (cleanDescription.length > MAX_LENGTH) {
    // Try to cut at a sentence or word boundary
    const truncated = cleanDescription.substring(0, IDEAL_LENGTH);
    const lastSentence = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSentence > IDEAL_LENGTH - 30) {
      return truncated.substring(0, lastSentence + 1);
    } else if (lastSpace > IDEAL_LENGTH - 20) {
      return truncated.substring(0, lastSpace) + '...';
    } else {
      return truncated + '...';
    }
  }

  return cleanDescription;
}

/**
 * Generate location-specific SEO metadata
 */
export function generateLocationSEO(
  locationName: string,
  districtName: string,
  serviceType?: string
): {
  title: string;
  description: string;
  keywords: string[];
} {
  const title = serviceType
    ? `${locationName} ${districtName} - ${serviceType} | Gül-Tekin Mühendislik`
    : `${locationName} ${districtName} - Su Deposu, Hidrofor, Pompa | Gül-Tekin Mühendislik`;

  const description = serviceType
    ? validateMetaDescription(
        `${districtName} ${locationName}'nde ${serviceType} hizmetleri. Profesyonel kurulum ve servis.`
      )
    : validateMetaDescription(
        `${districtName} ${locationName}'nde su deposu, hidrofor, ısı pompası ve tesisat hizmetleri. Profesyonel kurulum ve servis.`
      );

  const keywords = [
    locationName.toLowerCase(),
    districtName.toLowerCase(),
    'su deposu',
    'hidrofor',
    'ısı pompası',
    'mekanik tesisat',
    'muğla',
    serviceType?.toLowerCase()
  ].filter(Boolean) as string[];

  return { title, description, keywords };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate article structured data for blog posts
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Person",
      name: article.author,
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  };
}

/**
 * Clean and optimize URL slugs
 */
export function optimizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Check image alt text quality
 */
export function checkAltTextQuality(altText: string, imageName?: string): {
  isOptimized: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!altText || altText.trim().length === 0) {
    issues.push("Alt text is missing");
  } else {
    if (altText.length < 5) {
      issues.push("Alt text is too short");
    }
    if (altText.length > 125) {
      issues.push("Alt text is too long (> 125 characters)");
    }
    if (altText.toLowerCase().includes("image") || altText.toLowerCase().includes("picture")) {
      issues.push("Alt text contains redundant words like 'image' or 'picture'");
    }
    if (imageName && altText === imageName) {
      issues.push("Alt text is the same as the file name");
    }
  }

  return {
    isOptimized: issues.length === 0,
    issues,
  };
}

/**
 * Validate and improve alt text for images
 */
export function validateAltText(
  altText: string | undefined,
  fileName: string,
  context?: string
): string {
  if (altText && altText.trim().length > 0) {
    // Ensure alt text doesn't exceed recommended length (125 characters)
    const cleanAlt = altText.trim();
    return cleanAlt.length > 125 ? cleanAlt.substring(0, 122) + '...' : cleanAlt;
  }

  // Generate descriptive alt text from filename and context
  const cleanFileName = fileName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ')     // Replace hyphens and underscores with spaces
    .replace(/\d+/g, '')       // Remove numbers
    .trim();

  if (context) {
    const contextAlt = `${context} - ${cleanFileName}`;
    return contextAlt.length > 125 ? contextAlt.substring(0, 122) + '...' : contextAlt;
  }

  return cleanFileName || 'Görsel';
}