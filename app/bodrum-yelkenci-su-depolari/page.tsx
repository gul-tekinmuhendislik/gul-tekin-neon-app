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

async function getYelkenciSuDepolari(): Promise<Product[]> {
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
      AND marka = 'YELKENCİ'
      AND (kategori ILIKE '%su depo%' OR urun_adi ILIKE '%su depo%')
      AND slug IS NOT NULL
    ORDER BY
      CASE
        WHEN urun_adi ILIKE '%yatay%' THEN 1
        WHEN urun_adi ILIKE '%dikey%' OR urun_adi ILIKE '%dik%' THEN 2
        ELSE 3
      END,
      CAST(SUBSTRING(urun_adi FROM '[0-9]+') AS INTEGER) NULLS LAST,
      urun_adi
  `;

  return result as Product[];
}

export const metadata = {
  title: 'Bodrum Yelkenci Su Depoları - Polietilen Su Tankları | Gül-Tekin Mühendislik',
  description: 'Bodrum bölgesinde Yelkenci marka polietilen su depoları satış ve montaj. Yatay, dikey ve füze tip su tankları. 100 litreden 20.000 litreye kadar. Profesyonel kurulum hizmeti.',
  alternates: {
    canonical: 'https://gul-tekinmuhendislik.com/bodrum-yelkenci-su-depolari',
  },
  openGraph: {
    title: 'Bodrum Yelkenci Su Depoları',
    description: 'Bodrum için Yelkenci marka su depoları. Polietilen su tankları satış ve montaj.',
    url: 'https://gul-tekinmuhendislik.com/bodrum-yelkenci-su-depolari',
  }
};

export default async function BodrumYelkenciSuDepolariPage() {
  const products = await getYelkenciSuDepolari();

  // Group by type
  const yatayDepoler = products.filter(p => p.urun_adi.toLowerCase().includes('yatay'));
  const dikeyDepoler = products.filter(p =>
    (p.urun_adi.toLowerCase().includes('dikey') || p.urun_adi.toLowerCase().includes('dik')) &&
    !p.urun_adi.toLowerCase().includes('yatay')
  );
  const fuzeDepoler = products.filter(p => p.urun_adi.toLowerCase().includes('füze'));
  const prizmatikDepoler = products.filter(p => p.urun_adi.toLowerCase().includes('prizmatik'));

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Gül-Tekin Mühendislik - Bodrum Yelkenci Su Depoları",
    "description": "Bodrum bölgesinde Yelkenci marka su depoları satış ve montaj",
    "url": "https://gul-tekinmuhendislik.com/bodrum-yelkenci-su-depolari",
    "telephone": "+902523863554",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bodrum",
      "addressRegion": "Muğla",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "37.0344",
      "longitude": "27.4305"
    }
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Bodrum Yelkenci Su Depoları",
    "description": "Bodrum bölgesi için Yelkenci marka polietilen su depoları",
    "url": "https://gul-tekinmuhendislik.com/bodrum-yelkenci-su-depolari",
    "numberOfItems": products.length
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Bodrum Yelkenci Su Depoları
              </h1>
              <p className="text-xl lg:text-2xl max-w-3xl mx-auto opacity-95">
                Bodrum ve çevre bölgelerde Yelkenci marka polietilen su depoları satış ve montaj hizmeti.
                Türkiye'nin en güvenilir su deposu markası ile tanışın.
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
            <span className="text-gray-900 font-medium">Bodrum Yelkenci Su Depoları</span>
          </nav>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">UV Dayanımlı</h3>
              <p className="text-gray-600 text-sm">
                Güneş ışınlarına karşı dayanıklı özel polietilen malzeme
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">TSE Onaylı</h3>
              <p className="text-gray-600 text-sm">
                Tüm ürünler TSE belgeli ve gıdaya uygun
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hızlı Teslimat</h3>
              <p className="text-gray-600 text-sm">
                Bodrum bölgesinde aynı gün teslimat ve montaj
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Uzman Montaj</h3>
              <p className="text-gray-600 text-sm">
                Profesyonel ekibimizle garantili kurulum
              </p>
            </div>
          </div>

          {/* About Yelkenci */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Neden Yelkenci Su Depoları?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Kalite ve Güvenilirlik</h3>
                <p className="text-gray-600 mb-4">
                  Yelkenci, Türkiye'nin önde gelen su deposu üreticilerinden biridir.
                  50 yılı aşkın tecrübesi ile sektörün en güvenilir markasıdır.
                </p>
                <h3 className="font-semibold text-gray-900 mb-3">Bodrum İklimi İçin İdeal</h3>
                <p className="text-gray-600">
                  UV dayanımlı polietilen malzeme sayesinde Bodrum'un sıcak ve güneşli ikliminde
                  uzun yıllar sorunsuz kullanım sağlar.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Hijyenik ve Sağlıklı</h3>
                <p className="text-gray-600 mb-4">
                  Gıda uygunluk sertifikalı malzeme kullanılır. Su kalitesini korur,
                  yosun ve bakteri oluşumunu engeller.
                </p>
                <h3 className="font-semibold text-gray-900 mb-3">Geniş Kapasite Seçenekleri</h3>
                <p className="text-gray-600">
                  100 litreden 20.000 litreye kadar değişen kapasite seçenekleri ile
                  her ihtiyaca uygun çözüm.
                </p>
              </div>
            </div>
          </div>

          {/* Yatay Depolar */}
          {yatayDepoler.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Yatay Su Depoları
              </h2>
              <p className="text-gray-600 mb-6">
                Bodrum'da genellikle bahçe sulama, havuz ve villa kullanımı için tercih edilir.
                Yere paralel konumlandırılır, az yer kaplar.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {yatayDepoler.map((product) => (
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        {product.marka}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.urun_adi}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Dikey Depolar */}
          {dikeyDepoler.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Dikey Su Depoları
              </h2>
              <p className="text-gray-600 mb-6">
                Bodrum villalarında dar alanlarda kullanım için ideal. Dik konumda az alan kaplar, büyük hacim sağlar.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dikeyDepoler.map((product) => (
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        {product.marka}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.urun_adi}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Füze Depolar */}
          {fuzeDepoler.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Füze Tip Su Depoları
              </h2>
              <p className="text-gray-600 mb-6">
                Dar ve yüksek alanlara yerleştirme için özel tasarlanmış füze tipi depolar.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {fuzeDepoler.map((product) => (
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        {product.marka}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.urun_adi}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Prizmatik Depolar */}
          {prizmatikDepoler.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Prizmatik Kare Su Depoları
              </h2>
              <p className="text-gray-600 mb-6">
                Köşelerde ve dar alanlarda yerleştirme için kare kesitli özel tasarım depolar.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {prizmatikDepoler.map((product) => (
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        {product.marka}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.urun_adi}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Yelkenci su deposu bulunamadı.</p>
            </div>
          )}

          {/* Service Areas */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-8 mb-12 text-white">
            <h2 className="text-2xl font-bold mb-6">
              Bodrum ve Çevresinde Hizmet Veriyoruz
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Bodrum Merkez
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Turgutreis
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Yalıkavak
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Gümbet
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Bitez
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Gümüşlük
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Göltürkbükü
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Ortakent
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Yelkenci Su Deposu İçin Teklif Alın
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Bodrum bölgesinde ücretsiz keşif ve montaj hizmeti ile size en uygun su deposunu belirleyelim.
              Aynı gün teslimat imkanı.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/contact"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Teklif İsteyin
              </Link>
              <Link
                href="https://wa.me/905323177859?text=Merhaba, Bodrum için Yelkenci su deposu hakkında bilgi almak istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                WhatsApp'tan Yazın
              </Link>
              <a
                href="tel:+902523863554"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center"
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
