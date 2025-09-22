interface ReviewSchemaProps {
  itemReviewed: {
    "@type": 'Product' | 'Service' | 'LocalBusiness' | 'Organization';
    name: string;
    image?: string;
    description?: string;
    url?: string;
  };
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  author: {
    name: string;
    type?: 'Person' | 'Organization';
  };
  reviewBody?: string;
  datePublished: string;
  publisher?: {
    name: string;
    url?: string;
  };
}

export default function ReviewSchema(props: ReviewSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": props.itemReviewed["@type"],
      "name": props.itemReviewed.name,
      ...(props.itemReviewed.image && { "image": props.itemReviewed.image }),
      ...(props.itemReviewed.description && { "description": props.itemReviewed.description }),
      ...(props.itemReviewed.url && { "url": props.itemReviewed.url })
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": props.reviewRating.ratingValue,
      "bestRating": props.reviewRating.bestRating || 5,
      "worstRating": props.reviewRating.worstRating || 1
    },
    "author": {
      "@type": props.author.type || "Person",
      "name": props.author.name
    },
    ...(props.reviewBody && { "reviewBody": props.reviewBody }),
    "datePublished": props.datePublished,
    ...(props.publisher && {
      "publisher": {
        "@type": "Organization",
        "name": props.publisher.name,
        ...(props.publisher.url && { "url": props.publisher.url })
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}