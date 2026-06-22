import { CONTACT_INFO } from "@/lib/contact-info";

export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://gul-tekinmuhendislik.com/#business",
    "name": "Gül-Tekin Mühendislik",
    "image": "https://gul-tekinmuhendislik.com/logo.png",
    "url": "https://gul-tekinmuhendislik.com",
    "telephone": CONTACT_INFO.landline.tel,
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gökçebel Mah. İnönü Cad. 61/D",
      "addressLocality": "Yalıkavak",
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
      "https://share.google/VJ161BKEdDPp0vMKU",
      "https://www.facebook.com/gultekinbodrum",
      "https://www.instagram.com/gultekinmuhendislik48/",
      "https://www.linkedin.com/company/gul-tekinmuhendislik/?viewAsMember=true",
      "https://x.com/gul_tekin_muh",
      "https://www.youtube.com/@GÜLTEKİNMÜHENDİSLİK"
    ],
    "description": "Muğla bölgesinde profesyonel mühendislik, proje yönetimi ve danışmanlık hizmetleri sunan lider firma.",
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