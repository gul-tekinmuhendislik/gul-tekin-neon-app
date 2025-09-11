export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://ai.gul-tekinmuhendislik.com/#business",
    "name": "Gül-Tekin Mühendislik",
    "image": "https://ai.gul-tekinmuhendislik.com/logo.png",
    "url": "https://ai.gul-tekinmuhendislik.com",
    "telephone": "+902523850000",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Yalıkavak Mahallesi",
      "addressLocality": "Bodrum",
      "addressRegion": "Muğla",
      "postalCode": "48990",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 37.0982,
      "longitude": 27.2844
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "sameAs": [
      "https://share.google/XnDMvkV4bTVtWo6BV",
      "https://www.facebook.com/gultekinmuhendislik",
      "https://www.instagram.com/gultekinmuhendislik",
      "https://www.linkedin.com/company/gul-tekin-muhendislik"
    ],
    "description": "Yalıkavak ve Bodrum bölgesinde profesyonel mühendislik, proje yönetimi ve danışmanlık hizmetleri sunan lider firma.",
    "foundingDate": "2015",
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 37.0982,
        "longitude": 27.2844
      },
      "geoRadius": "50000"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "12"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}