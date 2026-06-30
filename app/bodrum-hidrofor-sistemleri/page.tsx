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

async function getHidroforUrunleri(): Promise<Product[]> {
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
      AND kategori = 'Hidrofor'
      AND slug IS NOT NULL
    ORDER BY
      CASE marka
        WHEN 'GRUNDFOS' THEN 1
        WHEN 'BAYMAK' THEN 2
        WHEN 'ATLANTİS' THEN 3
        WHEN 'WEPOMP' THEN 4
        ELSE 5
      END,
      urun_adi
  `;

  return result as Product[];
}

export const metadata = {
  title: 'Bodrum Hidrofor Sistemleri - Grundfos, Baymak, Atlantis | Gül-Tekin Mühendislik',
  description: 'Bodrum ve Muğla bölgesinde hidrofor sistemleri satış ve montaj hizmeti. Grundfos, Baymak, Atlantis markalarında kademeli ve paket hidroforlar. Profesyonel kurulum ve servis.',
  alternates: {
    canonical: 'https://gul-tekinmuhendislik.com/bodrum-hidrofor-sistemleri',
  },
  openGraph: {
    title: 'Bodrum Hidrofor Sistemleri - Profesyonel Montaj',
    description: 'Bodrum ve Muğla için hidrofor sistemleri. Grundfos, Baymak, Atlantis. Satış ve montaj hizmeti.',
    url: 'https://gul-tekinmuhendislik.com/bodrum-hidrofor-sistemleri',
  }
};

export default async function BodrumHidroforSistemleriPage() {
  const products = await getHidroforUrunleri();

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
    "name": "Gül-Tekin Mühendislik - Bodrum Hidrofor Sistemleri",
    "description": "Bodrum ve Muğla bölgesinde hidrofor sistemleri satış ve montaj hizmeti",
    "url": "https://gul-tekinmuhendislik.com/bodrum-hidrofor-sistemleri",
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
    "name": "Bodrum Hidrofor Sistemleri",
    "description": "Bodrum ve Muğla bölgesi için hidrofor sistemleri",
    "url": "https://gul-tekinmuhendislik.com/bodrum-hidrofor-sistemleri",
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-6">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Ana Sayfa
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/urunler" className="text-gray-500 hover:text-gray-700">
              Ürünler
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Bodrum Hidrofor Sistemleri</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Bodrum Hidrofor Sistemleri
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Bodrum ve Muğla bölgesinde hidrofor sistemleri satış, montaj ve servis hizmeti.
              Grundfos, Baymak, Atlantis gibi dünya markalarının yetkili satıcısıyız.
              Kademeli hidrofor, paket hidrofor ve özel çözümlerimizle su basınç problemlerinize kalıcı çözümler sunuyoruz.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Profesyonel Montaj</h3>
              <p className="text-gray-600 text-sm">
                Uzman ekibimizle standartlara uygun hidrofor kurulumu
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hızlı Servis</h3>
              <p className="text-gray-600 text-sm">
                Bodrum bölgesinde aynı gün servis ve arıza çözümü
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Garantili Ürünler</h3>
              <p className="text-gray-600 text-sm">
                Tüm hidrofor sistemlerinde üretici garantisi
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Uzman Kadro</h3>
              <p className="text-gray-600 text-sm">
                Deneyimli mühendis ve teknisyen ekibimiz
              </p>
            </div>
          </div>

          {/* Why Hidrofor Section */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Bodrum'da Neden Hidrofor Sistemi Gereklidir?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Su Basıncı Sorunları</h3>
                <p className="text-gray-600 mb-4">
                  Bodrum'da özellikle yaz aylarında yoğun turizm sebebiyle şebeke su basıncı düşebilir.
                  Hidrofor sistemleri sabit ve yeterli su basıncı sağlar.
                </p>
                <h3 className="font-semibold text-gray-900 mb-3">Villa ve Apartmanlar</h3>
                <p className="text-gray-600">
                  Çok katlı yapılarda üst katlara su çıkarmak için hidrofor zorunludur.
                  Özel villalarda bahçe sulama ve havuz için de kullanılır.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Enerji Tasarrufu</h3>
                <p className="text-gray-600 mb-4">
                  Modern frekans kontrollü hidroforlar sadece gerektiğinde çalışır ve %70'e varan enerji tasarrufu sağlar.
                </p>
                <h3 className="font-semibold text-gray-900 mb-3">Sessiz Çalışma</h3>
                <p className="text-gray-600">
                  Grundfos ve Baymak'ın sessiz çalışan modelleri yaşam alanlarınızda rahatsızlık yaratmaz.
                </p>
              </div>
            </div>
          </div>

          {/* Products by Brand */}
          {Object.entries(productsByBrand).map(([brand, brandProducts]) => (
            <div key={brand} className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {brand} Hidrofor Sistemleri
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
              <p className="text-gray-500">Hidrofor ürünü bulunamadı.</p>
            </div>
          )}

          {/* Service Areas */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 mb-12 text-white">
            <h2 className="text-2xl font-bold mb-6">
              Hizmet Verdiğimiz Bölgeler
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
                Milas
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hidrofor Sistemi Hakkında Bilgi Almak İster misiniz?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Uzman ekibimiz ihtiyacınıza en uygun hidrofor sistemini belirleyip,
              ücretsiz keşif ve teklifle size hizmet vermeye hazır. Bodrum bölgesinde aynı gün montaj imkanı.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/contact"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Teklif İsteyin
              </Link>
              <Link
                href="https://wa.me/905323177859?text=Merhaba, Bodrum hidrofor sistemleri hakkında bilgi almak istiyorum."
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
