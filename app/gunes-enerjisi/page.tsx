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

async function getGunesEnerjisiUrunleri(): Promise<Product[]> {
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
      AND slug IS NOT NULL
    ORDER BY
      CASE marka
        WHEN 'SOLİMPEKS' THEN 1
        WHEN 'BURAK' THEN 2
        WHEN 'ERASLAN' THEN 3
        WHEN 'JİNKO' THEN 4
        ELSE 5
      END,
      urun_adi
  `;

  return result as Product[];
}

export const metadata = {
  title: 'Güneş Enerjisi Sistemleri - Solar Panel, Kollektör, Boyler | Gül-Tekin Mühendislik',
  description: 'Güneş enerjisi sistemleri, solar panel, güneş kollektörü ve boyler satış ve montaj hizmeti. Solimpeks, Burak, Eraslan markalarında. Bodrum, Muğla bölgesinde profesyonel kurulum.',
  alternates: {
    canonical: 'https://gul-tekinmuhendislik.com/gunes-enerjisi',
  },
  openGraph: {
    title: 'Güneş Enerjisi Sistemleri - Solar Panel ve Kollektörler',
    description: 'Güneş enerjisi sistemleri satış ve montaj. Solimpeks, Burak, Eraslan markalarında.',
    url: 'https://gul-tekinmuhendislik.com/gunes-enerjisi',
  }
};

export default async function GunesEnerjisiPage() {
  const products = await getGunesEnerjisiUrunleri();

  // Group products by brand
  const productsByBrand = products.reduce((acc, product) => {
    const brand = product.marka || 'Diğer';
    if (!acc[brand]) {
      acc[brand] = [];
    }
    acc[brand].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Güneş Enerjisi Sistemleri",
    "description": "Güneş enerjisi sistemleri, solar panel ve güneş kollektörü ürünleri",
    "url": "https://gul-tekinmuhendislik.com/gunes-enerjisi",
    "numberOfItems": products.length
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Güneş Enerjisi Sistemleri Kurulum",
    "provider": {
      "@type": "Organization",
      "name": "Gül-Tekin Mühendislik"
    },
    "areaServed": {
      "@type": "State",
      "name": "Muğla"
    },
    "description": "Güneş enerjisi sistemleri satış, montaj ve servis hizmeti"
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
        <div className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Güneş Enerjisi Sistemleri
              </h1>
              <p className="text-xl lg:text-2xl max-w-3xl mx-auto opacity-95">
                Temiz enerji ile hem doğayı koruyun hem de enerji faturalarınızı düşürün.
                Solar panel, güneş kollektörü ve kombi sistemleri ile profesyonel çözümler.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Temiz Enerji</h3>
              <p className="text-gray-600 text-sm">
                Çevre dostu, yenilenebilir güneş enerjisi ile karbon ayak izinizi azaltın
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tasarruf</h3>
              <p className="text-gray-600 text-sm">
                Elektrik ve doğalgaz faturalarınızda %70'e varan tasarruf sağlayın
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Garantili Sistem</h3>
              <p className="text-gray-600 text-sm">
                25 yıla kadar garanti ile uzun ömürlü kullanım
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Profesyonel Montaj</h3>
              <p className="text-gray-600 text-sm">
                Uzman ekibimizle standartlara uygun kurulum
              </p>
            </div>
          </div>

          {/* System Types */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Güneş Enerjisi Sistemleri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  Fotovoltaik (Elektrik Üretimi)
                </h3>
                <p className="text-gray-600 mb-3">
                  Solar panel sistemleri ile elektrik üretin. Ürettiğiniz fazla elektriği şebekeye satın.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    25 yıl garanti
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Şebekeye satış imkanı
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Bakım gerektirmez
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </span>
                  Termal (Sıcak Su)
                </h3>
                <p className="text-gray-600 mb-3">
                  Güneş kollektörleri ve boyler sistemleri ile sıcak su ihtiyacınızı karşılayın.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Kombi kullanımını azaltır
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Yaz aylarında %100 verim
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Hızlı geri ödeme süresi
                  </li>
                </ul>
              </div>
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

          {/* Why Solar Energy */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Neden Güneş Enerjisi?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Çevre Dostu</h3>
                <p className="text-gray-600 text-sm">
                  Karbon emisyonunu azaltarak çevre korumaya katkıda bulunun
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ekonomik</h3>
                <p className="text-gray-600 text-sm">
                  İlk yatırımınızı 3-5 yılda amorti edin, sonrası tamamen tasarruf
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Bağımsızlık</h3>
                <p className="text-gray-600 text-sm">
                  Artan elektrik fiyatlarından etkilenmeyin, kendi enerjinizi üretin
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl shadow-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Güneş Enerjisi Sistemleri Hakkında Bilgi Alın
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
                href="https://wa.me/905323177859?text=Merhaba, güneş enerjisi sistemleri hakkında bilgi almak istiyorum."
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
                {CONTACT_INFO.landline.displayFormatted}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
