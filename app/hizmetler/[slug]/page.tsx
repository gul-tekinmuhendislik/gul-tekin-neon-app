import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getHizmetlerFromNeon } from '@/lib/hizmetler-client';
import { getUrunlerByHizmetIdFromNeon } from '@/lib/urunler-client';
import { Hizmet } from '@/lib/types/hizmet';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hizmetler = await getHizmetlerFromNeon() as Hizmet[];
  const hizmet = hizmetler.find((h) => h.slug === slug);
  
  if (!hizmet) {
    return {
      title: 'Hizmet Bulunamadı | Gül-Tekin Mühendislik',
      description: 'Aradığınız hizmet bulunamadı.'
    };
  }

  return {
    title: hizmet.seo_title || `${hizmet.hizmet_adi} | Gül-Tekin Mühendislik`,
    description: hizmet.seo_description || hizmet.aciklama || `Gül-Tekin Mühendislik ${hizmet.hizmet_adi} hizmetleri`,
    keywords: hizmet.marka_text?.join(', ') || hizmet.hizmet_adi,
    openGraph: {
      title: hizmet.seo_title || hizmet.hizmet_adi,
      description: hizmet.seo_description || hizmet.aciklama,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Gül-Tekin Mühendislik',
      images: (hizmet.cloudinary_url || hizmet.resim_url) ? [{ url: hizmet.cloudinary_url || hizmet.resim_url!, alt: hizmet.hizmet_adi }] : undefined,
    },
    alternates: {
      canonical: `/hizmetler/${slug}`,
    },
  };
}

// Comment out static generation - use dynamic rendering instead
// export async function generateStaticParams() {
//   const hizmetler = await getHizmetlerFromNeon() as Hizmet[];
//
//   return hizmetler
//     .filter((hizmet) => hizmet.slug || hizmet.seo_slug)
//     .map((hizmet) => ({
//       slug: hizmet.slug || hizmet.seo_slug,
//     }));
// }

// Force dynamic rendering for better performance and fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HizmetDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const hizmetler = await getHizmetlerFromNeon() as Hizmet[];
  const hizmet = hizmetler.find((h) => h.slug === slug);

  if (!hizmet) {
    notFound();
  }

  // Get related products for this service
  const ilgiliUrunler = await getUrunlerByHizmetIdFromNeon(hizmet.id);

  // Find related services from same category
  const relatedServices = hizmetler
    .filter((h) => h.kategori === hizmet.kategori && h.id !== hizmet.id)
    .slice(0, 3);

  // Service Schema Markup
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": hizmet.hizmet_adi,
    "description": hizmet.aciklama || `${hizmet.hizmet_adi} hizmeti`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Gül-Tekin Mühendislik",
      "url": "https://gul-tekinmuhendislik.com",
      "telephone": "+902522117171",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bodrum",
        "addressRegion": "Muğla",
        "addressCountry": "TR"
      },
      "priceRange": "₺₺₺"
    },
    "url": `https://gul-tekinmuhendislik.com/hizmetler/${slug}`,
    "category": hizmet.kategori,
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "37.0343",
        "longitude": "27.4305"
      },
      "geoRadius": "100000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${hizmet.hizmet_adi} Ürün ve Hizmetleri`,
      "itemListElement": hizmet.urunler?.map((urun: string) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": urun
        }
      })) || []
    }
  };

  // FAQ Schema for service page
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `${hizmet.hizmet_adi} hizmeti nedir?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": hizmet.aciklama || `Gül-Tekin Mühendislik olarak ${hizmet.hizmet_adi} konusunda profesyonel hizmet sunuyoruz.`
        }
      },
      {
        "@type": "Question",
        "name": `${hizmet.hizmet_adi} hizmeti hangi bölgelerde veriliyor?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bodrum, Yalıkavak, Turgutreis, Gümüşlük, Gündoğan ve Muğla'nın tüm ilçelerinde hizmet veriyoruz."
        }
      },
      {
        "@type": "Question",
        "name": "Keşif ücreti alıyor musunuz?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır, keşif hizmetimiz tamamen ücretsizdir. Projeniz için size en uygun çözümü sunmak için yerinde inceleme yapıyoruz."
        }
      },
      {
        "@type": "Question",
        "name": `${hizmet.hizmet_adi} için garanti veriyor musunuz?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, tüm işlerimizde 2 yıl işçilik garantisi ve üretici garantisi sunuyoruz. Kullandığımız malzemeler TSE ve CE standartlarına uygundur."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Ana Sayfa
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/hizmetler" className="text-gray-500 hover:text-gray-700">
            Hizmetler
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{hizmet.hizmet_adi}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {hizmet.hizmet_adi}
            </h1>
            
            {hizmet.kategori && (
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium mb-6">
                {hizmet.kategori}
              </div>
            )}

            {(hizmet.cloudinary_url || hizmet.resim_url) && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={hizmet.cloudinary_url || hizmet.resim_url!}
                  alt={hizmet.hizmet_adi}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed">
                {hizmet.aciklama}
              </p>
            </div>

            {/* Ana Faaliyet Konuları */}
            {hizmet.ana_faaliyet_konusu && hizmet.ana_faaliyet_konusu.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ana Faaliyet Konularımız
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hizmet.ana_faaliyet_konusu.map((konu: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{konu}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Markalar */}
            {hizmet.marka_text && hizmet.marka_text.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Çalıştığımız Markalar
                </h3>
                <div className="space-y-2">
                  {hizmet.marka_text.map((marka: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-blue-50 rounded-lg"
                    >
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm font-medium">{marka}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Box */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-3">
                Hemen Teklif Alın!
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                20 yıllık deneyimimiz ile size en uygun çözümü sunuyoruz.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Ücretsiz Keşif
                </li>
                <li className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Garanti & Servis
                </li>
                <li className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Profesyonel Ekip
                </li>
              </ul>
              <Link
                href="/contact"
                className="block w-full text-center bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors"
              >
                İletişime Geç
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {ilgiliUrunler.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              İlgili Ürünler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {ilgiliUrunler.map((urun) => (
                <div
                  key={urun.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
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
                    {urun.marka && (
                      <p className="text-sm text-blue-600 mb-2">{urun.marka}</p>
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
                      <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                        Detaylar
                        <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {ilgiliUrunler.length >= 12 && (
              <div className="text-center mt-6">
                <Link
                  href={`/urunler?hizmet=${hizmet.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tüm Ürünleri Görüntüle
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              İlgili Hizmetler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((related) => (
                <Link
                  key={related.id}
                  href={`/hizmetler/${related.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {(related.cloudinary_url || related.resim_url) && (
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <Image
                        src={related.cloudinary_url || related.resim_url!}
                        alt={related.hizmet_adi}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {related.hizmet_adi}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {related.aciklama}
                    </p>
                    <span className="inline-flex items-center text-blue-600 text-sm font-medium mt-3 group-hover:translate-x-1 transition-transform">
                      Detaylı Bilgi
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  );
}