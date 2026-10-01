import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { sql } from "@/lib/db";
import { getListingImageUrl } from "@/lib/utils/image-optimization";

interface Product {
  id: string;
  urun_adi: string;
  slug: string;
  aciklama?: string;
  gorsel_url?: string;
  cloudinary_url?: string;
}

async function getAldeaHeatPumps(): Promise<Product[]> {
  try {
    const products = await sql`
      SELECT id, urun_adi, slug, aciklama, gorsel_url, cloudinary_url
      FROM urunler
      WHERE marka = 'ALDEA'
        AND kategori = 'Isı Pompaları'
        AND aktif = true
        AND (stokta = true OR stokta IS NULL)
        AND slug IS NOT NULL
        AND urun_adi <> 'Aldea Monoblok Isı Pompaları'
      ORDER BY updated_at DESC NULLS LAST, urun_adi ASC
      LIMIT 4
    `;

    return Array.isArray(products) ? (products as unknown as Product[]) : [];
  } catch (error) {
    console.error("Error fetching Aldea heat pumps:", error);
    return [];
  }
}

export default async function AldeaProducts() {
  const products = await getAldeaHeatPumps();

  if (products.length === 0) return null;

  return (
    <section className="border-y border-slate-200/70 bg-white py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verimli ve sessiz iklimlendirme</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Aldea <span className="text-amber-700">Isı Pompaları</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Konut ve ticari projelere uygun Aldea monoblok çözümlerini keşfedin.
            </p>
          </div>
          <Link
            href="/urunler?marka=ALDEA&kategori=Is%C4%B1%20Pompalar%C4%B1"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-amber-800 transition-colors hover:text-amber-950"
          >
            Tüm Aldea ürünleri
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const image = product.cloudinary_url || product.gorsel_url;

            return (
              <Link
                key={product.id}
                href={`/urunler/${product.slug}`}
                className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:border-amber-300 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-50 p-5">
                  {image ? (
                    <Image
                      src={getListingImageUrl(image)}
                      alt={product.urun_adi}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      Aldea Isı Pompası
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded bg-amber-700 px-2.5 py-1 text-xs font-bold text-white">
                    ALDEA
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 min-h-11 text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-amber-800">
                    {product.urun_adi}
                  </h3>
                  {product.aciklama && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {product.aciklama}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-amber-800">
                    Ürünü incele
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}