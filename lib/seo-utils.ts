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

/**
 * Generate SEO-optimized alt text for product images
 */
export function generateProductAltText(
  productName: string,
  brand?: string,
  category?: string,
  location?: string
): string {
  const parts: string[] = [];

  if (location) parts.push(location);
  if (brand) parts.push(brand);
  parts.push(productName);
  if (category) parts.push(category);

  const altText = parts.join(' - ');
  return altText.length > 125 ? altText.substring(0, 122) + '...' : altText;
}

/**
 * Generate SEO-optimized alt text for service images
 */
export function generateServiceAltText(
  serviceName: string,
  location?: string,
  action?: string
): string {
  const parts: string[] = [];

  if (location) parts.push(location);
  parts.push(serviceName);
  if (action) parts.push(action);

  const altText = parts.join(' ');
  return altText.length > 125 ? altText.substring(0, 122) + '...' : altText;
}

/**
 * Generate SEO-optimized alt text for project images
 */
export function generateProjectAltText(
  projectName: string,
  location?: string,
  index?: number
): string {
  const parts: string[] = [];

  if (location) parts.push(location);
  parts.push(projectName);
  if (index !== undefined) parts.push(`görsel ${index + 1}`);
  else parts.push('projesi');

  const altText = parts.join(' ');
  return altText.length > 125 ? altText.substring(0, 122) + '...' : altText;
}

/**
 * Generate SEO-optimized alt text for brand/logo images
 */
export function generateBrandAltText(
  brandName: string,
  context?: string
): string {
  const parts: string[] = [brandName];

  if (context) parts.push(context);
  else parts.push('logo');

  const altText = parts.join(' ');
  return altText.length > 125 ? altText.substring(0, 122) + '...' : altText;
}

/**
 * Optimize page title for SEO (50-60 characters ideal)
 */
export function optimizeTitle(title: string, maxLength: number = 60): string {
  if (title.length <= maxLength) {
    return title;
  }

  // Try to cut at word boundary
  const truncated = title.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength - 15) {
    return truncated.substring(0, lastSpace).trim();
  }

  return truncated.trim() + '...';
}

/**
 * Create concise title with brand suffix
 */
export function createTitle(
  mainTitle: string,
  includeBrand: boolean = true,
  brandName: string = 'Gül-Tekin'
): string {
  const MAX_LENGTH = 60;

  if (!includeBrand) {
    return optimizeTitle(mainTitle, MAX_LENGTH);
  }

  const withBrand = `${mainTitle} | ${brandName}`;

  if (withBrand.length <= MAX_LENGTH) {
    return withBrand;
  }

  // If too long, shorten main title to fit brand
  const availableForMain = MAX_LENGTH - ` | ${brandName}`.length;
  const shortenedMain = optimizeTitle(mainTitle, availableForMain);

  return `${shortenedMain} | ${brandName}`;
}

/**
 * Generate FAQ Schema for services/products
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate HowTo Schema for installation/setup guides
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: Array<{ name: string; text: string; image?: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "image": step.image
    }))
  };
}

/**
 * Generate AggregateRating Schema for products/services
 */
export function generateRatingSchema(
  ratingValue: number,
  reviewCount: number,
  bestRating: number = 5
) {
  return {
    "@type": "AggregateRating",
    "ratingValue": ratingValue,
    "reviewCount": reviewCount,
    "bestRating": bestRating,
    "worstRating": 1
  };
}

/**
 * Common Turkish locations to detect in content
 */
export const COMMON_LOCATIONS = [
  { name: 'Bodrum', slug: 'bodrum' },
  { name: 'Yalıkavak', slug: 'yalikavak' },
  { name: 'Göltürkbükü', slug: 'golturkbuku' },
  { name: 'Gündoğan', slug: 'gundogan' },
  { name: 'Türkbükü', slug: 'turkbuku' },
  { name: 'Torba', slug: 'torba' },
  { name: 'Gümüşlük', slug: 'gumusluk' },
  { name: 'Bitez', slug: 'bitez' },
  { name: 'Ortakent', slug: 'ortakent' },
  { name: 'Turgutreis', slug: 'turgutreis' },
  { name: 'Muğla', slug: 'mugla' },
  { name: 'Milas', slug: 'milas' },
  { name: 'Yatağan', slug: 'yatagan' },
  { name: 'Ula', slug: 'ula' },
  { name: 'Fethiye', slug: 'fethiye' },
  { name: 'Marmaris', slug: 'marmaris' },
  { name: 'Datça', slug: 'datca' },
];

/**
 * Common brands to detect in content
 */
export const COMMON_BRANDS = [
  { name: 'Grundfos', slug: 'grundfos' },
  { name: 'Solimpeks', slug: 'solimpeks' },
  { name: 'Eraslan', slug: 'eraslan' },
  { name: 'Panasonic', slug: 'panasonic' },
  { name: 'Baymak', slug: 'baymak' },
  { name: 'Vaillant', slug: 'vaillant' },
  { name: 'Viessman', slug: 'viessman' },
  { name: 'Yelkenci', slug: 'yelkenci' },
  { name: 'Karyer', slug: 'karyer' },
  { name: 'Atlantis', slug: 'atlantis' },
  { name: 'Wilo', slug: 'wilo' },
  { name: 'DAB', slug: 'dab' },
  { name: 'Pedrollo', slug: 'pedrollo' },
];

/**
 * Extract locations mentioned in content
 */
export function extractLocationsFromContent(content: string): Array<{name: string, slug: string}> {
  const found: Array<{name: string, slug: string}> = [];
  const contentLower = content.toLowerCase();

  for (const location of COMMON_LOCATIONS) {
    // Case insensitive search
    const regex = new RegExp(`\\b${location.name}\\b`, 'gi');
    if (regex.test(content)) {
      found.push(location);
    }
  }

  // Remove duplicates
  return Array.from(new Map(found.map(item => [item.slug, item])).values());
}

/**
 * Extract brands mentioned in content
 */
export function extractBrandsFromContent(content: string): Array<{name: string, slug: string}> {
  const found: Array<{name: string, slug: string}> = [];

  for (const brand of COMMON_BRANDS) {
    const regex = new RegExp(`\\b${brand.name}\\b`, 'gi');
    if (regex.test(content)) {
      found.push(brand);
    }
  }

  // Remove duplicates
  return Array.from(new Map(found.map(item => [item.slug, item])).values());
}

/**
 * Add internal links to content for locations and brands
 */
export function addInternalLinksToContent(content: string): string {
  let linkedContent = content;

  // Add location links (only first occurrence)
  const addedLocations = new Set<string>();
  for (const location of COMMON_LOCATIONS) {
    if (!addedLocations.has(location.slug)) {
      // Replace first occurrence only
      const regex = new RegExp(`\\b(${location.name})\\b`, 'i');
      if (regex.test(linkedContent)) {
        linkedContent = linkedContent.replace(
          regex,
          `<a href="/lokasyonlar/${location.slug}" class="text-blue-600 hover:text-blue-700 underline font-medium">$1</a>`
        );
        addedLocations.add(location.slug);
      }
    }
  }

  // Add brand links (only first occurrence)
  const addedBrands = new Set<string>();
  for (const brand of COMMON_BRANDS) {
    if (!addedBrands.has(brand.slug)) {
      const regex = new RegExp(`\\b(${brand.name})\\b`, 'i');
      if (regex.test(linkedContent)) {
        linkedContent = linkedContent.replace(
          regex,
          `<a href="/markalar/${brand.slug}" class="text-blue-600 hover:text-blue-700 underline font-medium">$1</a>`
        );
        addedBrands.add(brand.slug);
      }
    }
  }

  return linkedContent;
}