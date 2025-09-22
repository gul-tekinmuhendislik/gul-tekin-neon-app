interface ProductSchemaProps {
  name: string;
  description?: string;
  image?: string | string[];
  sku?: string;
  mpn?: string;
  brand?: {
    name: string;
  };
  offers?: {
    price?: string | number;
    priceCurrency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'SoldOut';
    itemCondition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
    priceValidUntil?: string;
    seller?: {
      name: string;
      url?: string;
    };
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  review?: Array<{
    author: string;
    datePublished: string;
    reviewBody?: string;
    reviewRating: {
      ratingValue: number;
    };
  }>;
  category?: string;
  manufacturer?: string;
  model?: string;
  url?: string;
  gtin?: string;
  productID?: string;
}

export default function ProductSchema(props: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": props.name,
    ...(props.description && { "description": props.description }),
    ...(props.image && {
      "image": Array.isArray(props.image) ? props.image : [props.image]
    }),
    ...(props.sku && { "sku": props.sku }),
    ...(props.mpn && { "mpn": props.mpn }),
    ...(props.gtin && { "gtin": props.gtin }),
    ...(props.productID && { "productID": props.productID }),
    ...(props.brand && {
      "brand": {
        "@type": "Brand",
        "name": props.brand.name
      }
    }),
    ...(props.manufacturer && { "manufacturer": props.manufacturer }),
    ...(props.model && { "model": props.model }),
    ...(props.category && { "category": props.category }),
    ...(props.url && { "url": props.url }),
    ...(props.offers && {
      "offers": {
        "@type": "Offer",
        ...(props.offers.price && { "price": props.offers.price }),
        ...(props.offers.priceCurrency && { "priceCurrency": props.offers.priceCurrency || "TRY" }),
        ...(props.offers.availability && {
          "availability": `https://schema.org/${props.offers.availability}`
        }),
        ...(props.offers.itemCondition && {
          "itemCondition": `https://schema.org/${props.offers.itemCondition}`
        }),
        ...(props.offers.priceValidUntil && { "priceValidUntil": props.offers.priceValidUntil }),
        "seller": props.offers.seller || {
          "@type": "Organization",
          "name": "Gül-Tekin Mühendislik",
          "url": "https://gul-tekinmuhendislik.com"
        }
      }
    }),
    ...(props.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": props.aggregateRating.ratingValue,
        "reviewCount": props.aggregateRating.reviewCount,
        "bestRating": props.aggregateRating.bestRating || 5,
        "worstRating": props.aggregateRating.worstRating || 1
      }
    }),
    ...(props.review && {
      "review": props.review.map(r => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": r.author
        },
        "datePublished": r.datePublished,
        ...(r.reviewBody && { "reviewBody": r.reviewBody }),
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": r.reviewRating.ratingValue,
          "bestRating": "5",
          "worstRating": "1"
        }
      }))
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}