import { Metadata } from "next";

export const siteConfig = {
  name: "Gül-Tekin Mühendislik",
  url: "https://gul-tekinmuhendislik.com",
  description: "Bodrum ve Milas bölgesinde mekanik tesisat sistemleri, enerji verimliliği çözümleri. Isı pompası, güneş enerjisi, klima sistemleri kurulum ve servisi.",
  author: "Gül-Tekin Mühendislik",
  email: "info@gul-tekinmuhendislik.com",
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
    "Gül-Tekin Mühendislik",
    "Bodrum mekanik tesisat",
    "Milas ısı pompası",
    "güneş enerjisi sistemleri",
    "klima kurulumu",
    "su arıtma sistemleri",
    "yerden ısıtma",
    "enerji verimliliği",
    "mekanik mühendislik Bodrum",
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
        url: "/logo.png",
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
    images: ["/logo.png"],
    creator: "@gultekinmuh"
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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/logo.png',
    },
  },
};