import { Metadata } from "next";
import { Suspense } from "react";
import {
  getAllUrunler,
  getUrunCategories,
  getUrunBrands,
} from "@/lib/static-data";
import UrunlerList from "./urunler-list";
import UrunlerLive from "./urunler-live";

export const metadata: Metadata = {
  title: "Ürünler - Gül-Tekin Mühendislik",
  description:
    "Gül-Tekin Mühendislik olarak sunduğumuz ürünler ve çözümler. Isı pompaları, güneş enerjisi sistemleri, su arıtma ve mekanik tesisat ürünleri.",
  alternates: {
    canonical: "https://gul-tekinmuhendislik.com/urunler",
  },
};

export default function ProductsPage() {
  const allProducts = getAllUrunler();
  const categories = getUrunCategories();
  const brands = getUrunBrands();

  // The unfiltered first page is pre-rendered as static HTML; the live wrapper then
  // applies the filters and page from the URL.
  return (
    <Suspense
      fallback={
        <UrunlerList
          allProducts={allProducts}
          categories={categories}
          brands={brands}
          requestedPage={1}
        />
      }
    >
      <UrunlerLive allProducts={allProducts} categories={categories} brands={brands} />
    </Suspense>
  );
}
