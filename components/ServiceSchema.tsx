interface ServiceSchemaProps {
  name: string;
  description: string;
  provider?: {
    name: string;
    url: string;
  };
  areaServed?: string | string[];
  hasOfferCatalog?: {
    name: string;
    itemListElement: Array<{
      name: string;
      url?: string;
    }>;
  };
  serviceType?: string;
  category?: string;
  url?: string;
  image?: string;
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
  };
  offers?: {
    price?: string;
    priceCurrency?: string;
    priceRange?: string;
    availability?: string;
  };
}

export default function ServiceSchema(props: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": props.name,
    "description": props.description,
    "provider": props.provider || {
      "@type": "LocalBusiness",
      "name": "Gül-Tekin Mühendislik",
      "url": "https://gul-tekinmuhendislik.com",
      "telephone": "+902523850000",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Gökçebel Mah. İnönü Cad. 61/D",
        "addressLocality": "Yalıkavak",
        "addressRegion": "Muğla",
        "postalCode": "48990",
        "addressCountry": "TR"
      }
    },
    ...(props.serviceType && { "serviceType": props.serviceType }),
    ...(props.category && { "category": props.category }),
    ...(props.url && { "url": props.url }),
    ...(props.image && { "image": props.image }),
    ...(props.areaServed && {
      "areaServed": Array.isArray(props.areaServed) ? props.areaServed : [props.areaServed]
    }),
    ...(props.hasOfferCatalog && {
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": props.hasOfferCatalog.name,
        "itemListElement": props.hasOfferCatalog.itemListElement.map(item => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": item.name,
            ...(item.url && { "url": item.url })
          }
        }))
      }
    }),
    ...(props.aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": props.aggregateRating.ratingValue,
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": props.aggregateRating.ratingCount
      }
    }),
    ...(props.offers && {
      "offers": {
        "@type": "Offer",
        ...(props.offers.price && { "price": props.offers.price }),
        ...(props.offers.priceCurrency && { "priceCurrency": props.offers.priceCurrency }),
        ...(props.offers.priceRange && { "priceRange": props.offers.priceRange }),
        ...(props.offers.availability && { "availability": props.offers.availability })
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