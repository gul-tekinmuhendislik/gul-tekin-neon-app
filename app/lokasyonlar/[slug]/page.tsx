import { sql } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export const revalidate = 3600;

interface LokasyonPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Lokasyon {
  id: number;
  ilce_adi: string;
  slug: string;
  il?: string;
  aciklama?: string;
  resim_url?: string;
  aktif: boolean;
  sira?: number;
}

interface Urun {
  id: string;
  urun_adi: string;
  kategori?: string;
  marka?: string;
  cloudinary_url?: string;
}

interface Hizmet {
  id: string;
  hizmet_adi: string;
  aciklama?: string;
  kategori?: string;
  slug?: string;
  resim_url?: string;
  cloudinary_url?: string;
  urunler?: Urun[];
}

interface Mahalle {
  id: number;
  mahalle_adi: string;
  slug?: string;
  aciklama?: string;
  proje_sayisi?: number;
}

async function getLokasyonData(slug: string) {
  try {
    // Lokasyon bilgilerini al
    const [lokasyon] = await sql<Lokasyon[]>`
      SELECT
        id,
        ilce_adi,
        slug,
        il,
        aciklama,
        resim_url,
        aktif,
        sira
      FROM hizmet_lokasyonlari
      WHERE slug = ${slug} AND aktif = true
    `;

    if (!lokasyon) {
      return null;
    }

    // Hizmetleri al
    const hizmetlerResult = await sql<Hizmet[]>`
      SELECT
        h.id,
        h.hizmet_adi,
        h.aciklama,
        h.slug,
        h.resim_url,
        h.cloudinary_url,
        h.urunler,
        h.kategori
      FROM hizmetler h
      WHERE h.aktif = true
      ORDER BY h.seo_index ASC, h.hizmet_adi ASC
    `;

    // Her hizmet için ürünleri al
    const hizmetler = await Promise.all(
      hizmetlerResult.map(async (hizmet) => {
        if (hizmet.urunler && Array.isArray(hizmet.urunler) && hizmet.urunler.length > 0) {
          try {
            const urunler = await sql<Urun[]>`
              SELECT
                id,
                urun_adi,
                kategori,
                marka,
                cloudinary_url
              FROM urunler
              WHERE id = ANY(${hizmet.urunler}::text[])
              AND aktif = true
              LIMIT 5
            `;
            return { ...hizmet, urunler };
          } catch (error) {
            console.error(`Hizmet ID ${hizmet.id} için ürünler yüklenirken hata:`, error);
            return { ...hizmet, urunler: [] };
          }
        }
        return { ...hizmet, urunler: [] };
      })
    );

    // Mahalleleri al
    const mahalleler = await sql<Mahalle[]>`
      SELECT
        id,
        mahalle_adi,
        slug,
        aciklama,
        proje_sayisi
      FROM mahalleler
      WHERE ilce_id = ${lokasyon.id}
      ORDER BY mahalle_adi ASC
    `;

    return {
      lokasyon,
      hizmetler,
      mahalleler
    };
  } catch (error) {
    console.error('Lokasyon detayı alınırken hata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: LokasyonPageProps) {
  const { slug } = await params;
  const data = await getLokasyonData(slug);

  if (!data) {
    return {
      title: 'Lokasyon Bulunamadı',
      description: 'Aradığınız lokasyon bulunamadı.'
    };
  }

  const { lokasyon, mahalleler, hizmetler } = data;

  return {
    title: `${lokasyon.ilce_adi} ${lokasyon.il ? lokasyon.il : ''} - Su Deposu, Hidrofor, Isı Pompası | Gül-Tekin Mühendislik`,
    description: lokasyon.aciklama || `${lokasyon.ilce_adi} bölgesinde su deposu, hidrofor, ısı pompası ve tesisat hizmetleri. ${mahalleler.length} mahallede profesyonel kurulum ve servis.`,
    alternates: {
      canonical: `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}`,
    },
    openGraph: {
      title: `${lokasyon.ilce_adi} - Gül-Tekin Mühendislik Hizmetleri`,
      description: lokasyon.aciklama || `${lokasyon.ilce_adi} bölgesinde mühendislik hizmetleri`,
      images: lokasyon.resim_url ? [lokasyon.resim_url] : [],
      url: `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}`,
    }
  };
}

export default async function LokasyonDetayPage({ params }: LokasyonPageProps) {
  const { slug } = await params;
  const data = await getLokasyonData(slug);

  if (!data) {
    notFound();
  }

  const { lokasyon, hizmetler, mahalleler } = data;

  // Schema markup
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Gül-Tekin Mühendislik - ${lokasyon.ilce_adi}`,
    "description": lokasyon.aciklama || `${lokasyon.ilce_adi} bölgesinde mühendislik hizmetleri`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": lokasyon.ilce_adi,
      "addressRegion": lokasyon.il || "Muğla",
      "addressCountry": "TR"
    },
    "areaServed": {
      "@type": "City",
      "name": lokasyon.ilce_adi
    }
  };

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
        "name": "Lokasyonlar",
        "item": "https://gul-tekinmuhendislik.com/lokasyonlar"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": lokasyon.ilce_adi,
        "item": `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-br from-blue-600 to-blue-800">
          {lokasyon.resim_url && (
            <Image
              src={lokasyon.resim_url}
              alt={lokasyon.ilce_adi}
              fill
              className="object-cover opacity-30"
              priority
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                {lokasyon.ilce_adi}
              </h1>
              {lokasyon.il && (
                <p className="text-xl md:text-2xl">
                  {lokasyon.il}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          {/* Açıklama */}
          {lokasyon.aciklama && (
            <div className="max-w-4xl mx-auto mb-16 text-center">
              <p className="text-lg text-gray-600 leading-relaxed">
                {lokasyon.aciklama}
              </p>
            </div>
          )}

          {/* Mahalleler */}
          {mahalleler.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {lokasyon.ilce_adi} Mahalleleri
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mahalleler.map((mahalle) => {
                  const mahalleSlug = mahalle.slug || mahalle.mahalle_adi.toLowerCase()
                    .replace(/ı/g, 'i')
                    .replace(/ğ/g, 'g')
                    .replace(/ü/g, 'u')
                    .replace(/ş/g, 's')
                    .replace(/ö/g, 'o')
                    .replace(/ç/g, 'c')
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');

                  return (
                    <Link
                      key={mahalle.id}
                      href={`/lokasyonlar/${slug}/${mahalleSlug}`}
                      className="block"
                    >
                      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 text-center group hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 cursor-pointer hover:scale-105 border-2 border-transparent hover:border-blue-400">
                        <div className="text-blue-500 mb-2">
                          <svg
                            className="w-8 h-8 mx-auto group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors text-sm">
                          {mahalle.mahalle_adi}
                        </h3>
                        {mahalle.proje_sayisi !== undefined && mahalle.proje_sayisi > 0 && (
                          <p className="text-xs text-gray-500 mt-1">{mahalle.proje_sayisi} proje</p>
                        )}
                        <div className="mt-2 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-medium">Detayları Gör</span>
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {mahalleler.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-gray-600">
                    <span className="font-semibold text-blue-600">{mahalleler.length}</span> mahallede hizmet veriyoruz
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Hizmetler */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {lokasyon.ilce_adi} Bölgesinde Sunduğumuz Hizmetler
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hizmetler.map((hizmet) => (
                <Link key={hizmet.id} href={`/hizmetler/${hizmet.slug}`}>
                  <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {(hizmet.cloudinary_url || hizmet.resim_url) ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={hizmet.cloudinary_url || hizmet.resim_url || ''}
                          alt={hizmet.hizmet_adi}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {hizmet.hizmet_adi}
                      </h3>
                      {hizmet.kategori && (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2">
                          {hizmet.kategori}
                        </span>
                      )}
                      {hizmet.aciklama && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {hizmet.aciklama}
                        </p>
                      )}
                      {hizmet.urunler && hizmet.urunler.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Öne Çıkan Ürünler:</h4>
                          <div className="space-y-1">
                            {hizmet.urunler.map((urun) => (
                              <div key={urun.id} className="flex items-center text-xs text-gray-600">
                                {urun.cloudinary_url && (
                                  <Image
                                    src={urun.cloudinary_url}
                                    alt={urun.urun_adi}
                                    width={24}
                                    height={24}
                                    className="rounded-full object-cover mr-2"
                                  />
                                )}
                                <span className="truncate">{urun.urun_adi}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hizmetler.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Bu lokasyon için henüz hizmet eklenmemiş.</p>
              </div>
            )}
          </div>

          {/* İletişim CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {lokasyon.ilce_adi} Bölgesinde Mühendislik Hizmeti Mi Arıyorsunuz?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Uzman ekibimizle size özel çözümler sunmak için hazırız
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                İletişime Geç
              </Link>
              <Link
                href="/hizmetler"
                className="inline-block bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
              >
                Tüm Hizmetler
              </Link>
            </div>
          </div>

          {/* Diğer Lokasyonlar */}
          <div className="mt-16 text-center">
            <Link
              href="/lokasyonlar"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              Tüm Lokasyonlara Dön
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
