import { Metadata } from "next";
import BlogContent from "./blog-content";

export const metadata: Metadata = {
  title: "Blog | Gül-Tekin Mühendislik - Isı Pompası, Su Deposu, Hidrofor Rehberi",
  description: "Isı pompası, su deposu, hidrofor, su arıtma sistemleri hakkında uzman rehberleri okuyun. Bodrum ve Muğla'da mekanik tesisat çözümleri.",
  keywords: [
    "ısı pompası rehberi",
    "su deposu fiyatları",
    "hidrofor seçimi",
    "su arıtma sistemleri",
    "bodrum ısı pompası",
    "milas su deposu",
    "ısı pompası nasıl çalışır",
    "enerji tasarrufu",
    "Gül-Tekin Mühendislik blog"
  ],
  openGraph: {
    title: "Blog | Gül-Tekin Mühendislik",
    description: "Isı pompası, su deposu, hidrofor, su arıtma sistemleri hakkında uzman rehberleri okuyun.",
    type: "website",
    locale: "tr_TR",
    siteName: "Gül-Tekin Mühendislik",
    url: "https://gul-tekinmuhendislik.com/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Gül-Tekin Mühendislik",
    description: "Isı pompası ve su deposu rehberleri.",
  },
  alternates: {
    canonical: "https://gul-tekinmuhendislik.com/blog",
    languages: {
      "tr-TR": "https://gul-tekinmuhendislik.com/blog",
      "x-default": "https://gul-tekinmuhendislik.com/blog",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogPage() {
  return <BlogContent />;
}
