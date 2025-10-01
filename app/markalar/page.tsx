import { getMarkalariNeon } from '@/lib/markalar-client';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

// Force dynamic rendering since brand data can change
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const markalar = await getMarkalariNeon();

  return {
    title: 'Çalıştığımız Markalar | Gül-Tekin Mühendislik',
    description: `Gül-Tekin Mühendislik olarak ${markalar.length} güvenilir ve kaliteli markayla çalışıyoruz. Isı pompası, güneş enerjisi, klima ve mekanik tesisat sistemlerinde yetkili servis hizmetleri.`,
    keywords: markalar.map(m => m.marka_adi).join(', ') + ', yetkili servis, mekanik tesisat, Muğla, Bodrum',
    openGraph: {
      title: 'Çalıştığımız Markalar | Gül-Tekin Mühendislik',
      description: `${markalar.length} güvenilir markayla profesyonel çözümler sunuyoruz.`,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Gül-Tekin Mühendislik',
    },
    alternates: {
      canonical: '/markalar',
    },
  };
}

export default async function MarkalarPage() {
  const markalar = await getMarkalariNeon();

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
      }
    ]
  };

  // ItemList Schema for brands
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Gül-Tekin Mühendislik Çalıştığı Markalar",
    "description": "Güvenilir ve kaliteli markalarla çalışarak müşterilerimize en iyi hizmeti sunuyoruz",
    "numberOfItems": markalar.length,
    "itemListElement": markalar.map((marka, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Brand",
        "name": marka.marka_adi,
        "url": marka.website || `https://gul-tekinmuhendislik.com/markalar`,
        "logo": marka.cloudinary_url || marka.logo_url,
        "description": marka.aciklama || `${marka.marka_adi} ürünleri ve servis hizmetleri`
      }
    }))
  };

  // Organization Schema with brands
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gül-Tekin Mühendislik",
    "url": "https://gul-tekinmuhendislik.com",
    "logo": "https://gul-tekinmuhendislik.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+902522117171",
      "contactType": "customer service",
      "areaServed": "TR",
      "availableLanguage": "Turkish"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gökçebel Mah. İnönü Cad. 61/D",
      "addressLocality": "Yalıkavak",
      "addressRegion": "Muğla",
      "postalCode": "48400",
      "addressCountry": "TR"
    },
    "brand": markalar.filter(m => m.yetkili_servis).map(marka => ({
      "@type": "Brand",
      "name": marka.marka_adi,
      "description": `${marka.marka_adi} Yetkili Servisi`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          {/* Breadcrumb Navigation */}
          <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-500 hover:text-gray-700">
                  Ana Sayfa
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-900">Markalar</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Çalıştığımız Markalar
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Güvenilir ve kaliteli markalarla çalışarak, müşterilerimize en iyi hizmet ve ürünleri sunuyoruz.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {markalar.map((marka) => (
              marka.slug ? (
              <Link
                key={marka.id}
                href={`/markalar/${marka.slug}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col items-center justify-center group"
              >
                {(marka.cloudinary_url || marka.logo_url) ? (
                  <div className="w-full h-32 mb-4 flex items-center justify-center">
                    <Image
                      src={marka.cloudinary_url || marka.logo_url || ''}
                      alt={`${marka.marka_adi} logo`}
                      width={150}
                      height={150}
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 mb-4 flex items-center justify-center bg-gray-100 rounded">
                    <span className="text-3xl font-bold text-gray-400">
                      {marka.marka_adi?.charAt(0) || '?'}
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {marka.marka_adi}
                </h3>

                {marka.aciklama && (
                  <p className="text-sm text-gray-600 text-center line-clamp-3">
                    {marka.aciklama}
                  </p>
                )}

                {marka.yetkili_servis && (
                  <span className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Yetkili Servis
                  </span>
                )}
              </Link>
              ) : null
            ))}
          </div>

          {markalar.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Henüz marka bilgisi bulunmamaktadır.
              </p>
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Toplam {markalar.length} marka listeleniyor
            </p>
          </div>
        </div>
      </div>
    </>
  );
}