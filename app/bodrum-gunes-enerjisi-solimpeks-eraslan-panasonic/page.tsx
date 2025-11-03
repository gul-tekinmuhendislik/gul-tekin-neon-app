import { sql } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';

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

async function getBodrumGunesEnerjisiUrunleri(): Promise<Product[]> {
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
        kategori ILIKE '%güneş%'
        OR kategori ILIKE '%solar%'
        OR kategori = 'Pv Panel'
      )
      AND (
        marka IN ('SOLİMPEKS', 'ERASLAN', 'PANASONIC')
        OR marka ILIKE '%solimpeks%'
        OR marka ILIKE '%eraslan%'
        OR marka ILIKE '%panasonic%'
      )
      AND slug IS NOT NULL
    ORDER BY
      CASE marka
        WHEN 'SOLİMPEKS' THEN 1
        WHEN 'ERASLAN' THEN 2
        WHEN 'PANASONIC' THEN 3
        ELSE 4
      END,
      urun_adi
  `;

  return result as Product[];
}

export const metadata = {
  title: 'Bodrum Güneş Enerjisi - Solimpeks, Eraslan, Panasonic | Gül-Tekin Mühendislik',
  description: 'Bodrum ve Muğla bölgesinde güneş enerjisi sistemleri satış ve montaj. Solimpeks, Eraslan, Panasonic markalarında solar panel, güneş kollektörü ve kombi sistemleri. Profesyonel kurulum.',
  alternates: {
    canonical: 'https://gul-tekinmuhendislik.com/bodrum-gunes-enerjisi-solimpeks-eraslan-panasonic',
  },
  openGraph: {
    title: 'Bodrum Güneş Enerjisi - Solimpeks, Eraslan, Panasonic',
    description: 'Bodrum için güneş enerjisi sistemleri. Solimpeks, Eraslan, Panasonic. Satış ve profesyonel montaj hizmeti.',
    url: 'https://gul-tekinmuhendislik.com/bodrum-gunes-enerjisi-solimpeks-eraslan-panasonic',
  }
};

export default async function BodrumGunesEnerjisiPage() {
  const products = await getBodrumGunesEnerjisiUrunleri();

  // Group products by brand
  const productsByBrand = products.reduce((acc, product) => {
    const brand = product.marka || 'Diğer';
    if (!acc[brand]) {
      acc[brand] = [];
    }
    acc[brand].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Gül-Tekin Mühendislik - Bodrum Güneş Enerjisi",
    "description": "Bodrum ve Muğla bölgesinde güneş enerjisi sistemleri satış ve montaj hizmeti",
    "url": "https://gul-tekinmuhendislik.com/bodrum-gunes-enerjisi-solimpeks-eraslan-panasonic",
    "telephone": "+902522117171",
    "priceRange": "$$$",
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
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Bodrum"
      },
      {
        "@type": "City",
        "name": "Muğla"
      }
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Bodrum Güneş Enerjisi Sistemleri",
    "description": "Bodrum ve Muğla bölgesi için Solimpeks, Eraslan, Panasonic güneş enerjisi sistemleri",
    "url": "https://gul-tekinmuhendislik.com/bodrum-gunes-enerjisi-solimpeks-eraslan-panasonic",
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
        <div className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Bodrum Güneş Enerjisi Sistemleri
              </h1>
              <p className="text-xl lg:text-2xl max-w-3xl mx-auto opacity-95">
                Solimpeks, Eraslan ve Panasonic markalarıyla Bodrum'da güneş enerjisi çözümleri.
                Solar panel, güneş kollektörü ve kombi sistemleri ile profesyonel montaj hizmeti.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-6">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Ana Sayfa
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/gunes-enerjisi" className="text-gray-500 hover:text-gray-700">
              Güneş Enerjisi
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Bodrum</span>
          </nav>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Yüksek Güneş Potansiyeli</h3>
              <p className="text-gray-600 text-sm">
                Bodrum'da yıllık 300+ güneşli gün ile maksimum verim
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enerji Maliyetini Düşürün</h3>
              <p className="text-gray-600 text-sm">
                Elektrik ve doğalgaz faturalarınızda %70'e varan tasarruf
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Profesyonel Montaj</h3>
              <p className="text-gray-600 text-sm">
                Uzman ekibimizle standartlara uygun kurulum ve garanti
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hızlı Kurulum</h3>
              <p className="text-gray-600 text-sm">
                Bodrum bölgesinde kısa sürede devreye alma
              </p>
            </div>
          </div>

          {/* Why Solar Energy in Bodrum */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Bodrum'da Neden Güneş Enerjisi?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">İdeal İklim Koşulları</h3>
                <p className="text-gray-600 mb-4">
                  Bodrum, Türkiye'nin en çok güneş alan bölgelerinden biri. Yıllık ortalama 300'den fazla güneşli gün,
                  güneş enerjisi sistemleri için ideal koşullar sunuyor. Yaz aylarında %100, kış aylarında %60-70 verim elde edilebilir.
                </p>
                <h3 className="font-semibold text-gray-900 mb-3">Villa ve Yazlık Evler</h3>
                <p className="text-gray-600">
                  Bodrum'daki villa ve yazlıklarda yüksek elektrik tüketimi, özellikle yaz aylarında klima kullanımı nedeniyle artıyor.
                  Güneş enerjisi sistemleri ile bu maliyetleri minimum seviyeye indirebilirsiniz.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Havuz ve Bahçe Sulama</h3>
                <p className="text-gray-600 mb-4">
                  Havuz ısıtma ve bahçe sulama için yüksek enerji harcayan sistemler, güneş enerjisi ile çok daha ekonomik hale gelir.
                  Solimpeks havuz kollektörleri ile havuz suyunuzu güneşle ısıtabilirsiniz.
                </p>
                <h3 className="font-semibold text-gray-900 mb-3">Değer Artışı</h3>
                <p className="text-gray-600">
                  Güneş enerjisi sistemi olan gayrimenkullerin değeri artıyor. Alıcılar için önemli bir tercih sebebi olan
                  enerji verimliliği, mülkünüze değer katıyor.
                </p>
              </div>
            </div>
          </div>

          {/* Brand Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Solimpeks</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Türkiye'nin lider güneş enerjisi markası
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Güneş kollektörü ve termal sistemler
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Havuz ısıtma sistemleri
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Kombi entegreli sistemler
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Eraslan</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Ekonomik ve kaliteli çözümler
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Geniş ürün yelpazesi
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Basınçlı ve termosifon sistemler
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Uzun ömürlü, dayanıklı ürünler
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Panasonic</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Dünya çapında tanınmış marka
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Yüksek verimli solar paneller
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  25 yıl performans garantisi
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  İleri teknoloji HIT teknolojisi
                </li>
              </ul>
            </div>
          </div>

          {/* Products by Brand */}
          {Object.entries(productsByBrand).map(([brand, brandProducts]) => (
            <div key={brand} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {brand} Güneş Enerjisi Sistemleri
                </h2>
                <span className="text-sm text-gray-500">
                  {brandProducts.length} ürün
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {brandProducts.map((product) => (
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
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
          ))}

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Güneş enerjisi ürünü bulunamadı.</p>
            </div>
          )}

          {/* Service Areas */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 mb-12 text-white">
            <h2 className="text-2xl font-bold mb-6">
              Bodrum'da Hizmet Verdiğimiz Bölgeler
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
                Torba
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Kumbahçe
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Ortakent
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Konacık
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Güvercinlik
              </div>
            </div>
          </div>

          {/* Installation Process */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Kurulum Süreci
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Keşif ve Analiz</h3>
                <p className="text-sm text-gray-600">
                  Uzman ekibimiz yerinize gelir, çatı analizi yapar ve size özel sistem tasarlar
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Teklif ve Proje</h3>
                <p className="text-sm text-gray-600">
                  Detaylı fiyat teklifi ve teknik proje hazırlanır, geri ödeme süresi hesaplanır
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Montaj</h3>
                <p className="text-sm text-gray-600">
                  Profesyonel montaj ekibimiz sistemi hızlı ve güvenli şekilde kurar
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Devreye Alma</h3>
                <p className="text-sm text-gray-600">
                  Sistem testleri yapılır, kullanıcı eğitimi verilir ve garanti belgesi teslim edilir
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl shadow-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Bodrum'da Güneş Enerjisi Sistemleri Hakkında Bilgi Alın
            </h2>
            <p className="text-lg mb-6 opacity-95 max-w-2xl mx-auto">
              Uzman ekibimiz size özel güneş enerjisi çözümü sunmak için hazır.
              Ücretsiz keşif ve ön proje ile size en uygun sistemi belirleyelim.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/contact"
                className="px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Ücretsiz Keşif İsteyin
              </Link>
              <Link
                href="https://wa.me/905323177859?text=Merhaba, Bodrum güneş enerjisi sistemleri hakkında bilgi almak istiyorum."
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
                href="tel:+902523863554"
                className="px-6 py-3 bg-orange-700 text-white font-medium rounded-lg hover:bg-orange-800 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (0252) 386 35 54
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
