import { sql } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { CONTACT_INFO } from '@/lib/contact-info';

export const revalidate = 3600;

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

async function getSolimpeksIsiPompalari(): Promise<Product[]> {
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
      AND marka ILIKE '%solimpeks%'
      AND (
        kategori ILIKE '%ısı%pompa%'
        OR kategori ILIKE '%isı%pompa%'
        OR kategori ILIKE '%havuz%ısı%'
        OR kategori ILIKE '%havuz%isı%'
        OR urun_adi ILIKE '%ısı%pompa%'
        OR urun_adi ILIKE '%isı%pompa%'
      )
      AND slug IS NOT NULL
    ORDER BY
      CASE
        WHEN urun_adi ILIKE '%havuz%' THEN 1
        WHEN urun_adi ILIKE '%inverter%' THEN 2
        ELSE 3
      END,
      CAST(SUBSTRING(urun_adi FROM '[0-9]+') AS INTEGER) NULLS LAST,
      urun_adi
  `;

  return result as Product[];
}

export const metadata = {
  title: 'Solimpeks Isı Pompaları - İnverter ve Havuz Isı Pompası | Gül-Tekin Mühendislik',
  description: 'Solimpeks marka ısı pompaları satış ve montaj hizmeti. İnverter monoblok ısı pompaları ve havuz ısı pompaları. Bodrum, Muğla bölgesinde profesyonel kurulum.',
  alternates: {
    canonical: 'https://gul-tekinmuhendislik.com/solimpeks-isi-pompalari',
  },
  openGraph: {
    title: 'Solimpeks Isı Pompaları - İnverter Sistem',
    description: 'Solimpeks ısı pompaları. İnverter teknoloji ile enerji tasarrufu.',
    url: 'https://gul-tekinmuhendislik.com/solimpeks-isi-pompalari',
  }
};

export default async function SolimpeksIsiPompalariPage() {
  const products = await getSolimpeksIsiPompalari();

  // Group by type
  const havuzPompalari = products.filter(p => p.urun_adi.toLowerCase().includes('havuz'));
  const inverterPompalari = products.filter(p =>
    p.urun_adi.toLowerCase().includes('inverter') && !p.urun_adi.toLowerCase().includes('havuz')
  );
  const digerPompalari = products.filter(p =>
    !p.urun_adi.toLowerCase().includes('havuz') && !p.urun_adi.toLowerCase().includes('inverter')
  );

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Solimpeks Isı Pompaları",
    "description": "Solimpeks marka ısı pompaları, inverter ve havuz ısı pompası sistemleri",
    "url": "https://gul-tekinmuhendislik.com/solimpeks-isi-pompalari",
    "numberOfItems": products.length
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Solimpeks Isı Pompası Kurulum",
    "provider": {
      "@type": "Organization",
      "name": "Gül-Tekin Mühendislik"
    },
    "areaServed": {
      "@type": "State",
      "name": "Muğla"
    },
    "description": "Solimpeks ısı pompası satış, montaj ve servis hizmeti"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-block mb-4">
                <span className="text-sm font-semibold bg-white/20 px-4 py-2 rounded-full">
                  Türkiye'nin Öncü Markası
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Solimpeks Isı Pompaları
              </h1>
              <p className="text-xl lg:text-2xl max-w-3xl mx-auto opacity-95">
                Enerji verimliliğinde lider Solimpeks marka ısı pompaları.
                İnverter teknolojisi ile %70'e varan tasarruf.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Ana Sayfa
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/urunler" className="text-gray-500 hover:text-gray-700">
              Ürünler
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Solimpeks Isı Pompaları</span>
          </nav>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">İnverter Teknoloji</h3>
              <p className="text-gray-600 text-sm">
                Değişken hız teknolojisi ile sürekli optimum verim
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">%70 Tasarruf</h3>
              <p className="text-gray-600 text-sm">
                Geleneksel sistemlere göre %70'e varan enerji tasarrufu
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Çevre Dostu</h3>
              <p className="text-gray-600 text-sm">
                R32 soğutucu gaz ile düşük karbon emisyonu
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">5 Yıl Garanti</h3>
              <p className="text-gray-600 text-sm">
                Uzun ömürlü kullanım ve geniş garanti kapsamı
              </p>
            </div>
          </div>

          {/* About Solimpeks Heat Pumps */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Solimpeks Isı Pompaları Neden Tercih Edilmeli?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  İnverter Teknolojisi
                </h3>
                <p className="text-gray-600 mb-3">
                  Değişken hız kompresör teknolojisi sayesinde ihtiyaca göre kapasitesini ayarlar.
                  Sürekli açılıp kapanmadan çalışarak enerji tasarrufu ve konfor sağlar.
                </p>

                <h3 className="font-semibold text-gray-900 mb-3 mt-6 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  4 Mevsim Kullanım
                </h3>
                <p className="text-gray-600">
                  Kışın ısıtma, yazın soğutma yapabilir. -25°C'ye kadar ısıtma performansı.
                  Bodrum'un ılıman ikliminde yıl boyu verimli çalışır.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Sessiz Çalışma
                </h3>
                <p className="text-gray-600 mb-3">
                  Özel ses yalıtımlı kompresör ve fan tasarımı ile 35 dB(A)'ya kadar düşük ses seviyesi.
                  Villalarda rahatsızlık yaratmadan kullanım.
                </p>

                <h3 className="font-semibold text-gray-900 mb-3 mt-6 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  Akıllı Kontrol
                </h3>
                <p className="text-gray-600">
                  WiFi modülü ile uzaktan kontrol. Telefon uygulaması ile her yerden yönetim.
                  Haftalık programlama ve oda termostatlı kontrol.
                </p>
              </div>
            </div>
          </div>

          {/* Havuz Isı Pompaları */}
          {havuzPompalari.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Solimpeks Havuz Isı Pompaları
              </h2>
              <p className="text-gray-600 mb-6">
                Havuzunuzu yıl boyu kullanın. Solimpeks havuz ısı pompaları ile havuz suyunuzu ekonomik şekilde ısıtın.
                Bodrum'da özel havuzlar için ideal çözüm.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {havuzPompalari.map((product) => (
                  <Link
                    key={product.id}
                    href={`/urunler/${product.slug}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      {(product.cloudinary_url || product.gorsel_url) ? (
                        <Image
                          src={product.cloudinary_url || product.gorsel_url || ''}
                          alt={product.urun_adi}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                      {product.stokta !== undefined && (
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.stokta
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stokta ? 'Stokta' : 'Stok Dışı'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                        {product.marka}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
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
            </div>
          )}

          {/* İnverter Isı Pompaları */}
          {inverterPompalari.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Solimpeks İnverter Isı Pompaları
              </h2>
              <p className="text-gray-600 mb-6">
                Ev ısıtma ve soğutma için en verimli çözüm. Monoblok tasarım ile kolay kurulum.
                Yerden ısıtma ve radyatör sistemleri ile uyumlu.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inverterPompalari.map((product) => (
                  <Link
                    key={product.id}
                    href={`/urunler/${product.slug}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      {(product.cloudinary_url || product.gorsel_url) ? (
                        <Image
                          src={product.cloudinary_url || product.gorsel_url || ''}
                          alt={product.urun_adi}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                      {product.stokta !== undefined && (
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.stokta
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stokta ? 'Stokta' : 'Stok Dışı'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                        {product.marka}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
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
            </div>
          )}

          {/* Diğer Pompaları */}
          {digerPompalari.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Diğer Solimpeks Isı Pompaları
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {digerPompalari.map((product) => (
                  <Link
                    key={product.id}
                    href={`/urunler/${product.slug}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-50">
                      {(product.cloudinary_url || product.gorsel_url) ? (
                        <Image
                          src={product.cloudinary_url || product.gorsel_url || ''}
                          alt={product.urun_adi}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                      {product.stokta !== undefined && (
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.stokta
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stokta ? 'Stokta' : 'Stok Dışı'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                        {product.marka}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
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
            </div>
          )}

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Solimpeks ısı pompası ürünü bulunamadı.</p>
            </div>
          )}

          {/* Benefits */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Isı Pompası Avantajları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Düşük İşletme Maliyeti</h3>
                <p className="text-gray-600 text-sm">
                  1 kW elektrik tüketimi ile 4-5 kW ısı üretimi
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Çevre Dostu</h3>
                <p className="text-gray-600 text-sm">
                  Yanma olmadan çalışır, CO2 emisyonu yoktur
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Hem Isıtma Hem Soğutma</h3>
                <p className="text-gray-600 text-sm">
                  Tek cihaz ile tüm yıl konfor sağlar
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Solimpeks Isı Pompası İçin Teklif Alın
            </h2>
            <p className="text-lg mb-6 opacity-95 max-w-2xl mx-auto">
              Uzman ekibimiz size özel ısı pompası çözümü sunmak için hazır.
              Ücretsiz keşif ve ısı kaybı hesaplaması ile en uygun sistemi belirleyelim.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/contact"
                className="px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Ücretsiz Keşif
              </Link>
              <Link
                href="https://wa.me/905323177859?text=Merhaba, Solimpeks ısı pompaları hakkında bilgi almak istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                WhatsApp
              </Link>
              <a
                href={CONTACT_INFO.landline.tel}
                className="px-6 py-3 bg-orange-700 text-white font-medium rounded-lg hover:bg-orange-800 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {CONTACT_INFO.landline.displayFormatted}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
