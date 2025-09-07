import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./fonts";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { defaultMetadata } from "./metadata";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Gul Tekin - Mekanik Mühendislik ve AI Çözümleri",
    url: "https://your-domain.com",
    description: "Mekanik mühendislik uzmanlığı ve yapay zeka destekli çözümler",
    author: {
      "@type": "Person",
      name: "Gul Tekin",
      email: "gultekinozgur5@gmail.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://your-domain.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="tr" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
