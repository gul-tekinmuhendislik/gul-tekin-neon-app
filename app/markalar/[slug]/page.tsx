import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMarkalariNeon, getMarkaBySlug } from '@/lib/markalar-client';
import { getUrunlerByMarka } from '@/lib/urunler-client';
import Image from 'next/image';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const marka = await getMarkaBySlug(slug);

  if (!marka) {
    return {
      title: 'Marka Bulunamadı | Gül-Tekin Mühendislik',
      description: 'Aradığınız marka bulunamadı.'
    };
  }

  return {
    title: `${marka.marka_adi} | Gül-Tekin Mühendislik${marka.yetkili_servis ? ' - Yetkili Servis' : ''}`,
    description: marka.aciklama || `${marka.marka_adi} ürünleri ve ${marka.yetkili_servis ? 'yetkili ' : ''}servis hizmetleri. Muğla bölgesinde profesyonel çözümler.`,
    keywords: `${marka.marka_adi}, ${marka.kategori || 'mekanik tesisat'}, ${marka.yetkili_servis ? 'yetkili servis, ' : ''}Muğla, Bodrum`,
    openGraph: {
      title: `${marka.marka_adi} | Gül-Tekin Mühendislik`,
      description: marka.aciklama || `${marka.marka_adi} ürünleri ve servis hizmetleri`,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Gül-Tekin Mühendislik',
      images: marka.cloudinary_url || marka.logo_url ? [{
        url: marka.cloudinary_url || marka.logo_url!,
        alt: `${marka.marka_adi} logo`
      }] : undefined,
    },
    alternates: {
      canonical: `/markalar/${slug}`,
    },
  };
}

export default async function MarkaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const marka = await getMarkaBySlug(slug);

  if (!marka) {
    notFound();
  }

  const urunler = await getUrunlerByMarka(marka.marka_adi);

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://gul-tekinmuhendislik.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Markalar",
        "item": "https://gul-tekinmuhendislik.com/markalar"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": marka.marka_adi,
        "item": `https://gul-tekinmuhendislik.com/markalar/${slug}`
      }
    ]
  };

  // Brand Schema
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": marka.marka_adi,
    "description": marka.aciklama || `${marka.marka_adi} ürünleri ve servis hizmetleri`,
    "logo": marka.cloudinary_url || marka.logo_url,
    "url": marka.website || `https://gul-tekinmuhendislik.com/markalar/${slug}`,
    "slogan": marka.yetkili_servis ? "Yetkili Servis" : undefined
  };

  // Product List Schema (if there are products)
  const productListSchema = urunler.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${marka.marka_adi} Ürünleri`,
    "numberOfItems": urunler.length,
    "itemListElement": urunler.map((urun, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": urun.urun_adi,
        "description": urun.aciklama || urun.urun_adi,
        "brand": {
          "@type": "Brand",
          "name": marka.marka_adi
        },
        "image": urun.cloudinary_url || urun.gorsel_url,
        "offers": {
          "@type": "Offer",
          "availability": urun.stokta ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      }
    }))
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      {productListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href="/markalar" className="text-gray-500 hover:text-gray-700">
                    Markalar
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-900">{marka.marka_adi}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Brand Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
            <div className="md:flex">
              <div className="md:w-1/3 bg-gray-50 p-8 flex items-center justify-center">
                {(marka.cloudinary_url || marka.logo_url) ? (
                  <Image
                    src={marka.cloudinary_url || marka.logo_url!}
                    alt={`${marka.marka_adi} logo`}
                    width={300}
                    height={300}
                    className="max-w-full h-auto object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-6xl font-bold text-gray-400">
                      {marka.marka_adi?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div className="md:w-2/3 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {marka.marka_adi}
                  </h1>
                  {marka.yetkili_servis && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Yetkili Servis
                    </span>
                  )}
                </div>

                {marka.kategori && (
                  <p className="text-gray-500 mb-4">{marka.kategori}</p>
                )}

                {marka.aciklama && (
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {marka.aciklama}
                  </p>
                )}

                {marka.website && (
                  <a
                    href={marka.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Marka Web Sitesi
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {marka.marka_adi} Ürünleri
              <span className="ml-3 text-lg text-gray-500 font-normal">
                ({urunler.length} ürün)
              </span>
            </h2>

            {urunler.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {urunler.filter(urun => urun.slug).map((urun) => (
                  <Link
                    key={urun.id}
                    href={`/urunler/${urun.slug}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group block"
                  >
                    {(urun.cloudinary_url || urun.gorsel_url) ? (
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <Image
                          src={urun.cloudinary_url || urun.gorsel_url!}
                          alt={urun.urun_adi}
                          width={300}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {urun.urun_adi}
                      </h3>
                      {urun.hizmet_adi && (
                        <p className="text-sm text-blue-600 mb-2">{urun.hizmet_adi}</p>
                      )}
                      {urun.aciklama && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {urun.aciklama}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        {urun.stokta !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            urun.stokta
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {urun.stokta ? 'Stokta' : 'Tükendi'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-4 text-gray-500">
                  Bu marka için henüz ürün kaydı bulunmamaktadır.
                </p>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">
                {marka.marka_adi} Ürünleri Hakkında Bilgi Almak İster Misiniz?
              </h3>
              <p className="text-blue-100 mb-6">
                {marka.yetkili_servis
                  ? `${marka.marka_adi} yetkili servisi olarak size en iyi hizmeti sunmak için buradayız.`
                  : `${marka.marka_adi} ürünleri hakkında detaylı bilgi almak ve teklif için bizimle iletişime geçin.`
                }
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                İletişime Geç
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
