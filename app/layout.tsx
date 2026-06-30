import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { outfit } from "./fonts";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import CookieBanner from "./components/CookieBanner";
import { defaultMetadata } from "./metadata";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CONTACT_INFO } from "@/lib/contact-info";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Gül-Tekin Mühendislik",
    "url": "https://gul-tekinmuhendislik.com",
    "description": "Muğla bölgesinde mekanik tesisat sistemleri ve enerji verimliliği çözümleri. Isı pompası, güneş enerjisi, klima sistemleri kurulum ve servisi.",
    "image": "https://gul-tekinmuhendislik.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gökçebel Mah. İnönü Cad. 61/D",
      "addressLocality": "Yalıkavak",
      "addressRegion": "Muğla",
      "postalCode": "48900",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "37.1776",
      "longitude": "27.2713"
    },
    "telephone": CONTACT_INFO.landline.tel,
    "email": CONTACT_INFO.email,
    "priceRange": "₺₺",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday"],
        "opens": "08:00",
        "closes": "14:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/gultekinbodrum",
      "https://x.com/gul_tekin_muh",
      "https://github.com/gul-tekinmuhendislik"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "8",
      "reviewCount": "8"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://gul-tekinmuhendislik.com/urunler?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="tr" className={outfit.variable}>
      <body className="flex flex-col min-h-screen">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-55ZTFYPJ0R"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-55ZTFYPJ0R');`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
