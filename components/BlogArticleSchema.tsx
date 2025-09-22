import Script from 'next/script';

interface BlogArticleSchemaProps {
  title: string;
  description: string;
  author?: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
  keywords?: string[];
}

export default function BlogArticleSchema({
  title,
  description,
  author = 'Gül-Tekin Mühendislik',
  datePublished,
  dateModified,
  image,
  url,
  keywords = []
}: BlogArticleSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": author,
      "url": "https://gul-tekinmuhendislik.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Gül-Tekin Mühendislik",
      "url": "https://gul-tekinmuhendislik.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gul-tekinmuhendislik.com/assets/logo.svg"
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image
      }
    }),
    ...(keywords.length > 0 && {
      "keywords": keywords.join(", ")
    })
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData)
      }}
    />
  );
}