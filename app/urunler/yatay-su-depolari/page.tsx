import Image from 'next/image';
import Link from 'next/link';
import {
  getAllUrunler,
  type Urun,
} from '@/lib/static-data';
import { createTitle, validateAltText } from '@/lib/seo-utils';

export const revalidate = 3600;

export const metadata = {
  title: createTitle('Yatay Su Depoları - Polietilen ve Polyester Su Tankları | Gül-Tekin Mühendislik'),
  description: 'Yatay su depoları, polietilen su tankları ve polyester su depoları. Toprak altı ve toprak üstü su depolama çözümleri. Bodrum, Muğla bölgesinde montaj hizmeti.',
  alternates: {
    canonical: 'https://gul-tekinmuhendislik.com/urunler/yatay-su-depolari',
  },
  openGraph: {
    title: 'Yatay Su Depoları - Su Tankları',
    description: 'Yatay ve dikey su depoları. Polietilen ve polyester su tankları.',
    url: 'https://gul-tekinmuhendislik.com/urunler/yatay-su-depolari',
  }
};

function getSuDepolari(): Urun[] {
  const allUrunler = getAllUrunler();
  return allUrunler.filter((product) => {
    const kategori = (product.kategori || '').toLowerCase();
    const urunAdi = (product.urun_adi || '').toLowerCase();
    return (
      product.aktif !== false &&
      (
        (kategori === 'su depoları' || kategori === 'toprak üstü su deposu' || kategori === 'toprak altı su deposu') ||
        urunAdi.includes('su depo')
      ) &&
      !!product.slug
    );
  });
}

export default function YataySuDepolariPage() {
  const products = getSuDepolari();

  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Su Depoları",
    "description": "Yatay ve dikey su depoları, polietilen ve polyester su tankları",
    "url": "https://gul-tekinmuhendislik.com/urunler/yatay-su-depolari",
    "numberOfItems": products.length
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
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
            <span className="text-gray-900 font-medium">Su Depoları</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Su Depoları
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Yatay ve dikey su depoları, polietilen ve polyester su tankları.
              Toprak altı ve toprak üstü su depolama çözümleri.
              100 litreden 130.000 litreye kadar çeşitli kapasitelerde.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Kaliteli Malzeme</h3>
              <p className="text-gray-600 text-sm">
                UV dayanımlı polietilen ve polyester malzemeden üretilmiş su depoları
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Geniş Kapasite Seçeneği</h3>
              <p className="text-gray-600 text-sm">
                100 litreden 130.000 litreye kadar değişen kapasite seçenekleri
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Profesyonel Montaj</h3>
              <p className="text-gray-600 text-sm">
                Bodrum ve Muğla bölgesinde uzman ekibimizle montaj hizmeti
              </p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/urunler/${product.slug}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-square relative overflow-hidden bg-gray-50">
                  {(product.cloudinary_url || product.gorsel_url) ? (
                    <Image
                      src={product.cloudinary_url || product.gorsel_url || ''}
                      alt={validateAltText(product.urun_adi, product.cloudinary_url || product.gorsel_url || '', product.urun_adi)}
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
                  {product.kategori && (
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      {product.kategori}
                    </span>
                  )}
                  {product.marka && (
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide ml-2">
                      {product.marka}
                    </span>
                  )}
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

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Su deposu bulunamadı.</p>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-12 bg-blue-600 rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              İhtiyacınıza Uygun Su Deposunu Bulamadınız mı?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Uzman ekibimiz size özel çözümler sunmak için hazır.
              İhtiyaçlarınızı detaylı olarak değerlendirip en uygun su deposunu bulmanızda yardımcı olalım.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                İletişime Geçin
              </Link>
              <Link
                href="https://wa.me/905323177859?text=Merhaba, su depoları hakkında bilgi almak istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
