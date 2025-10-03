import { sql } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { getListingImageUrl } from "@/lib/utils/image-optimization";

interface Product {
  id: string;
  urun_adi: string;
  slug: string;
  kategori?: string;
  marka?: string;
  aciklama?: string;
  cloudinary_url?: string;
}

async function getLGProducts() {
  try {
    const products = await sql`
      SELECT
        id,
        urun_adi,
        slug,
        kategori,
        marka,
        aciklama,
        cloudinary_url
      FROM urunler
      WHERE marka = 'LG' AND (stokta = true OR stokta IS NULL)
      ORDER BY updated_at DESC
      LIMIT 6
    `;
    return Array.isArray(products) ? products as unknown as Product[] : [];
  } catch (error) {
    console.error("Error fetching LG products:", error);
    return [];
  }
}

export default async function LGProducts() {
  const products = await getLGProducts();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-1 w-12 bg-purple-500 rounded-full"></div>
              <h2 className="text-4xl font-bold text-gray-900">
                LG <span className="text-purple-600">Therma V</span> Isı Pompaları
              </h2>
              <div className="h-1 w-12 bg-purple-500 rounded-full"></div>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dünya lideri LG'nin yeni nesil Therma V R32 Monobloc serisi.
              A+++ enerji sınıfı, -25°C'de çalışma, 65°C su sıcaklığı ve çevre dostu R32 teknolojisi.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/urunler/${product.slug}`}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200"
              >
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-50 to-gray-50">
                  {product.cloudinary_url ? (
                    <Image
                      src={getListingImageUrl(product.cloudinary_url)}
                      alt={product.urun_adi}
                      fill
                      className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-300">
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white shadow-lg">
                      LG
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-lg">
                      A+++
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.urun_adi}
                  </h3>
                  {product.aciklama && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                      {product.aciklama}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    {product.kategori && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {product.kategori}
                      </span>
                    )}
                    <span className="inline-flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700">
                      Detaylar
                      <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link
              href="/urunler?marka=LG"
              className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Tüm LG Ürünlerini Gör
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
