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