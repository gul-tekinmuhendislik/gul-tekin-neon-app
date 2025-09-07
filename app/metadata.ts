import { Metadata } from "next";

export const siteConfig = {
  name: "Gul Tekin - Mekanik Mühendislik ve AI Çözümleri",
  url: "https://your-domain.com", // Replace with actual domain
  description: "Mekanik mühendislik uzmanlığı ve yapay zeka destekli çözümler. Vercel ve Neon PostgreSQL ile güçlendirilmiş modern web uygulamaları.",
  author: "Gul Tekin",
  email: "gultekinozgur5@gmail.com",
  locale: "tr_TR",
  type: "website",
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "mekanik mühendislik",
    "yapay zeka",
    "AI çözümleri",
    "Vercel",
    "Neon PostgreSQL",
    "web uygulamaları",
    "Groq AI",
    "Llama 3.3",
  ],
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: "/og-image.png", // You'll need to create this
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/og-image.png"],
    creator: "@yourhandle", // Replace with actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
};