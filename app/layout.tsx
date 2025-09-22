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
    "@type": "LocalBusiness",
    name: "Gül-Tekin Mühendislik",
    url: "https://gul-tekinmuhendislik.com",
    description: "Muğla bölgesinde mekanik tesisat sistemleri ve enerji verimliliği çözümleri",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Yalıkavak",
      addressRegion: "Muğla",
      addressCountry: "TR"
    },
    telephone: "+902522117171",
    email: "info@gul-tekinmuhendislik.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://gul-tekinmuhendislik.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="tr" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/logo.png" />
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
