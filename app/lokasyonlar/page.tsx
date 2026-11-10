import { Metadata } from "next";
import { getAllLokasyonlar, type Lokasyon } from "@/lib/static-data";
import LokasyonlarContent from "./lokasyonlar-content";

export const metadata: Metadata = {
  title: "Hizmet Verdiğimiz Lokasyonlar",
  description: "Muğla, Bodrum, Milas, Datça, Fethiye ve çevresinde su deposu, hidrofor, ısı pompası ve tesisat hizmetleri. 13 ilçede profesyonel mühendislik çözümleri.",
  keywords: [
    "Muğla tesisat",
    "Bodrum su deposu",
    "Milas hidrofor",
    "Datça ısı pompası",
    "Fethiye tesisat",
    "Marmaris su deposu",
    "Dalaman tesisat",
    "Köyceğiz hidrofor",
    "Ortaca ısı pompası",
    "Yatağan tesisat",
    "Ula su deposu",
    "Seydikemer hizmetleri",
    "Kavaklıdere tesisat",
    "Menteşe tesisat"
  ],
  openGraph: {
    title: "Hizmet Verdiğimiz Lokasyonlar",
    description: "Muğla ve çevresinde 13 ilçede profesyonel mühendislik hizmetleri sunuyoruz.",
    type: "website",
    locale: "tr_TR",
    siteName: "Gül-Tekin Mühendislik",
    url: "https://gul-tekinmuhendislik.com/lokasyonlar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hizmet Verdiğimiz Lokasyonlar",
    description: "Muğla ve çevresinde profesyonel tesisat hizmetleri.",
  },
  alternates: {
    canonical: "https://gul-tekinmuhendislik.com/lokasyonlar",
    languages: {
      "tr-TR": "https://gul-tekinmuhendislik.com/lokasyonlar",
      "x-default": "https://gul-tekinmuhendislik.com/lokasyonlar",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LokasyonlarPage() {
  const lokasyonlar = getAllLokasyonlar() as Lokasyon[];
  return <LokasyonlarContent lokasyonlar={lokasyonlar} />;
}
