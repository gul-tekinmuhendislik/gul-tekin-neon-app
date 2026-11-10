"use client";

import { useSearchParams } from "next/navigation";
import type { Urun } from "@/lib/static-data";
import UrunlerList from "./urunler-list";

interface UrunlerLiveProps {
  allProducts: Urun[];
  categories: { kategori: string; count: number }[];
  brands: { marka: string; count: number }[];
}

// Reads filters and page from the URL in the browser. Static export cannot read
// search params at build time.
export default function UrunlerLive({ allProducts, categories, brands }: UrunlerLiveProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("kategori") || undefined;
  const selectedBrand = searchParams.get("marka") || undefined;
  const searchQuery = searchParams.get("search") || undefined;
  const requestedPage = parseInt(searchParams.get("page") || "1", 10);

  return (
    <UrunlerList
      allProducts={allProducts}
      categories={categories}
      brands={brands}
      selectedCategory={selectedCategory}
      selectedBrand={selectedBrand}
      searchQuery={searchQuery}
      requestedPage={requestedPage}
    />
  );
}
