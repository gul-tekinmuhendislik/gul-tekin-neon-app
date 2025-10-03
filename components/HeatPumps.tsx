import { sql } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  urun_adi: string;
  slug: string;
  aciklama?: string;
  kategori?: string;
  marka?: string;
  gorsel_url?: string;
  cloudinary_url?: string;
  stokta?: boolean;
}

async function getHeatPumps(): Promise<Product[]> {
  try {
    const result = await sql`
      SELECT
        id,
        urun_adi,
        slug,
        aciklama,
        kategori,
        marka,
        gorsel_url,
        cloudinary_url,
        stokta
      FROM urunler
      WHERE aktif = true
        AND (
          kategori ILIKE '%ısı%pompa%'
          OR kategori ILIKE '%isı%pompa%'
          OR urun_adi ILIKE '%ısı%pompa%'
          OR urun_adi ILIKE '%isı%pompa%'
        )
        AND slug IS NOT NULL
      ORDER BY
        CASE
          WHEN marka ILIKE '%varmeks%' THEN 1
          WHEN marka ILIKE '%lg%' THEN 2
          ELSE 3
        END,
        urun_adi
      LIMIT 4
    `;

    return result as Product[];
  } catch (error) {
    console.error('Error fetching heat pumps:', error);
    return [];
  }
}

export default async function HeatPumps() {
  const heatPumps = await getHeatPumps();

  if (heatPumps.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold bg-orange-100 text-orange-700 px-4 py-2 rounded-full">
                Enerji Verimliliği
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Isı Pompaları
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              En son teknoloji ısı pompaları ile %70'e varan enerji tasarrufu.
              Hem ısıtma hem soğutma, tek sistemde.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">%70 Tasarruf</h3>
              <p className="text-sm text-gray-600">
                Geleneksel sistemlere göre düşük işletme maliyeti
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Çevre Dostu</h3>
              <p className="text-sm text-gray-600">
                Düşük karbon emisyonu, yenilenebilir enerji
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">4 Mevsim</h3>
              <p className="text-sm text-gray-600">
                Kışın ısıtma, yazın soğutma yapabilir
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">İnverter</h3>
              <p className="text-sm text-gray-600">
                Değişken hız teknolojisi, sürekli verim
              </p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {heatPumps.map((product) => (
              <Link
                key={product.id}
                href={`/urunler/${product.slug}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200 hover:-translate-y-1"
              >
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-orange-50">
                  {(product.cloudinary_url || product.gorsel_url) ? (
                    <Image
                      src={product.cloudinary_url || product.gorsel_url || ''}
                      alt={product.urun_adi}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}
                  {product.stokta !== undefined && (
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        product.stokta
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {product.stokta ? 'Stokta' : 'Stok Dışı'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {product.marka && (
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                      {product.marka}
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                    {product.urun_adi}
                  </h3>
                  {product.aciklama && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {product.aciklama}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              href="/solimpeks-isi-pompalari"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-full hover:from-orange-700 hover:to-red-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Tüm Isı Pompalarını Görüntüle
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
