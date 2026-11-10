import Image from "next/image";
import Link from "next/link";
import { getAllUrunler } from "@/lib/static-data";
import { ArrowRight, Sparkles } from "lucide-react";

interface Product {
  id: string;
  urun_adi: string;
  slug: string;
  kategori?: string;
  marka?: string;
  aciklama?: string;
  cloudinary_url?: string;
  updated_at?: string;
}

function getLGProducts(): Product[] {
  try {
    const products = getAllUrunler()
      .filter((p) =>
        p.marka &&
        p.marka.toLowerCase().includes('lg') &&
        (p.aktif !== false || p.aktif === undefined) &&
        (p.stokta === true || p.stokta === undefined || p.stokta === null)
      )
      .sort((a, b) =>
        new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      )
      .slice(0, 3);

    return products;
  } catch (error) {
    console.error("Error fetching LG products:", error);
    return [];
  }
}

export default function LGProducts() {
  const products = getLGProducts();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-slate-50/70 border-y border-slate-200/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100/80 text-purple-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Alternatif Global Çözüm</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              LG <span className="text-purple-600">Therma V</span> R32 Monobloc Serisi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-light">
              A+++ enerji sınıfı, -25°C dış ortam dayanımı ve kompakt monoblok mimari.
            </p>
          </div>

          <Link
            href="/urunler?marka=LG"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors whitespace-nowrap"
          >
            <span>Tüm LG Modelleri</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Compact 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/urunler/${product.slug}`}
              className="group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-slate-200/80 hover:border-purple-300"
            >
              {/* Product Thumbnail */}
              <div className="h-44 relative bg-gradient-to-br from-purple-50/50 to-slate-50 p-4 flex items-center justify-center">
                {product.cloudinary_url ? (
                  <Image
                    src={product.cloudinary_url}
                    alt={product.urun_adi}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-slate-300 text-xs">LG Therma V</div>
                )}
                
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white">
                    LG
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                    A+++
                  </span>
                </div>
              </div>

              {/* Product Info Compact */}
              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1.5 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {product.urun_adi}
                  </h3>
                  {product.aciklama && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-light mb-3">
                      {product.aciklama}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">R32 Monoblok</span>
                  <span className="font-medium text-purple-600 group-hover:underline flex items-center gap-1">
                    Detaylar →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
