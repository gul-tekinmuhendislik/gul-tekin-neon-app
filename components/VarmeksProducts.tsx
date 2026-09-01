import { sql } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { getListingImageUrl } from "@/lib/utils/image-optimization";
import { Zap, ShieldCheck, Sparkles, ArrowRight, Flame, Droplets } from "lucide-react";

interface Product {
  id: string;
  urun_adi: string;
  slug: string;
  kategori?: string;
  marka?: string;
  aciklama?: string;
  cloudinary_url?: string;
}

async function getVarmeksHomeProducts() {
  try {
    // Sadece Ev ve Villa Tipi Isı Pompalarını getir (Havuz ve Ticari modeller hariç)
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
      WHERE (marka ILIKE '%Varmeks%' OR marka = 'Varmeks')
        AND aktif = true
        AND urun_adi NOT ILIKE '%pool%'
        AND urun_adi NOT ILIKE '%havuz%'
        AND urun_adi NOT ILIKE '%commercial%'
        AND (kategori IS NULL OR (kategori NOT ILIKE '%havuz%' AND kategori NOT ILIKE '%pool%'))
        AND (stokta = true OR stokta IS NULL)
      ORDER BY
        CASE
          WHEN urun_adi ILIKE '%BOOST%' THEN 1
          WHEN urun_adi ILIKE '%UP%' THEN 2
          WHEN urun_adi ILIKE '%ALL%' THEN 3
          ELSE 4
        END,
        urun_adi ASC
      LIMIT 4
    `;
    return Array.isArray(products) ? (products as unknown as Product[]) : [];
  } catch (error) {
    console.error("Error fetching Varmeks residential products:", error);
    return [];
  }
}

export default async function VarmeksProducts() {
  const products = await getVarmeksHomeProducts();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background Subtle Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00E599]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs sm:text-sm font-semibold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Ev & Villa İklimlendirme Çözümleri</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Varmeks <span className="text-red-600">Ev Tipi Isı Pompaları</span>
          </h2>
          
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Ege ve Akdeniz iklimine özel geliştirilen R290 ve R32 teknolojili monoblok ev tipi ısı pompaları. 
            Isıtma, soğutma ve 75°C kullanım sıcak suyu tek ünitede.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {products.map((product) => {
            const isBoost = product.urun_adi.toUpperCase().includes("BOOST");
            const isUp = product.urun_adi.toUpperCase().includes("UP");
            const isAll = product.urun_adi.toUpperCase().includes("ALL");

            let seriesBadge = "Ev Tipi";
            let featureTag = "A+++ Verimlilik";
            if (isBoost) {
              seriesBadge = "R290 Monoblok";
              featureTag = "75°C Sıcak Su";
            } else if (isUp) {
              seriesBadge = "EVI DC Inverter";
              featureTag = "-30°C Dayanım";
            } else if (isAll) {
              seriesBadge = "Isı Pompalı Boyler";
              featureTag = "COP 4.1";
            }

            return (
              <Link
                key={product.id}
                href={`/urunler/${product.slug}`}
                className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200/80 hover:border-red-500/40 hover:-translate-y-1.5"
              >
                {/* Product Image Container */}
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-slate-50 via-red-50/20 to-slate-100 p-6 flex items-center justify-center">
                  {product.cloudinary_url ? (
                    <Image
                      src={getListingImageUrl(product.cloudinary_url)}
                      alt={product.urun_adi}
                      fill
                      className="object-contain p-6 group-hover:scale-108 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Zap className="w-16 h-16 stroke-1" />
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-md">
                      Varmeks
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900/80 text-white backdrop-blur-sm">
                      {seriesBadge}
                    </span>
                  </div>

                  {/* Feature Pill Top Right */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {featureTag}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base lg:text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {product.urun_adi}
                    </h3>
                    
                    {product.aciklama ? (
                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-light">
                        {product.aciklama}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-light">
                        Yüksek verimli DC Inverter ev tipi ısı pompası sistemi.
                      </p>
                    )}
                  </div>

                  {/* Card Bottom / Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-xs font-medium text-slate-500">
                      Ev & Villa Serisi
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 group-hover:text-red-700">
                      İncele
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button & Sub CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Link
            href="/urunler?marka=Varmeks"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:scale-102 active:scale-98"
          >
            <span>Tüm Ev Tipi Varmeks Modellerini Gör</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-full transition-all duration-200"
          >
            <span>Ücretsiz Keşif & Projelendirme</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
