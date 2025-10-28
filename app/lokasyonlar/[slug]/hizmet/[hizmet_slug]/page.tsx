import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const revalidate = 3600;

interface LokasyonHizmetPageProps {
  params: Promise<{
    slug: string;
    hizmet_slug: string;
  }>;
}

interface Lokasyon {
  id: number;
  ilce_adi: string;
  slug: string;
  il?: string;
  aciklama?: string;
  resim_url?: string;
}

interface Hizmet {
  id: string;
  hizmet_adi: string;
  aciklama?: string;
  kategori?: string;
  slug?: string;
  resim_url?: string;
  cloudinary_url?: string;
}

interface Urun {
  id: string;
  urun_adi: string;
  kategori?: string;
  marka?: string;
  cloudinary_url?: string;
  aciklama?: string;
  ozellikler?: string;
}

async function getLokasyonHizmetData(lokasyonSlug: string, hizmetSlug: string) {
  try {
    // Lokasyon bilgilerini al
    const lokasyon = await prisma.hizmet_lokasyonlari.findFirst({
      where: {
        slug: lokasyonSlug,
        aktif: true
      }
    });

    if (!lokasyon) {
      return null;
    }

    // Hizmet bilgilerini al
    const hizmet = await prisma.hizmetler.findFirst({
      where: {
        slug: hizmetSlug,
        aktif: true
      }
    });

    if (!hizmet) {
      return null;
    }

    // Bu hizmete ait ürünleri al
    // Kategori veya ürün adında hizmet adı geçenler + hizmetin urunler listesindekiler
    const urunler = hizmet.hizmet_adi ? await prisma.urunler.findMany({
      where: {
        aktif: true,
        OR: [
          {
            kategori: {
              contains: hizmet.hizmet_adi,
              mode: 'insensitive'
            }
          },
          {
            urun_adi: {
              contains: hizmet.hizmet_adi,
              mode: 'insensitive'
            }
          },
          ...(hizmet.urunler && Array.isArray(hizmet.urunler) && hizmet.urunler.length > 0
            ? [{ id: { in: hizmet.urunler as string[] } }]
            : []
          )
        ]
      },
      orderBy: [
        { siralama_no: 'asc' },
        { urun_adi: 'asc' }
      ],
      take: 50
    }) : [];

    return {
      lokasyon,
      hizmet,
      urunler
    };
  } catch (error) {
    console.error('Lokasyon hizmet detayı alınırken hata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: LokasyonHizmetPageProps) {
  const { slug, hizmet_slug: hizmetSlug } = await params;
  const data = await getLokasyonHizmetData(slug, hizmetSlug);

  if (!data) {
    return {
      title: 'Sayfa Bulunamadı',
      description: 'Aradığınız sayfa bulunamadı.'
    };
  }

  const { lokasyon, hizmet, urunler } = data;

  const hizmetAdi = hizmet.hizmet_adi || 'Hizmet';
  const title = `${lokasyon.ilce_adi} ${hizmetAdi} - ${urunler.length} Ürün ve Çözüm | Gül-Tekin Mühendislik`;

  const description = hizmet.aciklama ||
    `${lokasyon.ilce_adi} bölgesinde ${hizmetAdi} hizmeti için ${urunler.length} farklı ürün ve çözüm. Profesyonel kurulum, montaj, bakım ve servis hizmetleri. ${lokasyon.il || 'Muğla'} genelinde uzman ekip ile 7/24 destek.`;

  return {
    title,
    description,
    keywords: [
      `${lokasyon.ilce_adi} ${hizmetAdi.toLowerCase()}`,
      `${lokasyon.ilce_adi} ${hizmetAdi.toLowerCase()} fiyat`,
      `${lokasyon.ilce_adi} ${hizmetAdi.toLowerCase()} kurulum`,
      `${lokasyon.ilce_adi} ${hizmetAdi.toLowerCase()} montaj`,
      `${lokasyon.il || 'Muğla'} ${hizmetAdi.toLowerCase()}`,
      ...urunler.slice(0, 5).map(u => `${lokasyon.ilce_adi} ${(u.urun_adi || '').toLowerCase()}`),
    ],
    alternates: {
      canonical: `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/hizmet/${hizmetSlug}`,
      languages: {
        'tr-TR': `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/hizmet/${hizmetSlug}`,
        'x-default': `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/hizmet/${hizmetSlug}`,
      },
    },
    openGraph: {
      title: `${lokasyon.ilce_adi} ${hizmet.hizmet_adi} - Gül-Tekin Mühendislik`,
      description,
      images: hizmet.cloudinary_url || hizmet.resim_url ? [hizmet.cloudinary_url || hizmet.resim_url || ''] : [],
      url: `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/hizmet/${hizmetSlug}`,
      type: 'website',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: hizmet.cloudinary_url || hizmet.resim_url ? [hizmet.cloudinary_url || hizmet.resim_url || ''] : [],
    }
  };
}

export default async function LokasyonHizmetPage({ params }: LokasyonHizmetPageProps) {
  const { slug, hizmet_slug: hizmetSlug } = await params;
  const data = await getLokasyonHizmetData(slug, hizmetSlug);

  if (!data) {
    notFound();
  }

  const { lokasyon, hizmet, urunler } = data;

  const hizmetAdi = hizmet.hizmet_adi || 'Hizmet';

  // Schema markup
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${hizmetAdi} - ${lokasyon.ilce_adi}`,
    "description": hizmet.aciklama || `${lokasyon.ilce_adi} bölgesinde ${hizmetAdi} hizmeti`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Gül-Tekin Mühendislik",
      "telephone": "+90-252-313-40-13",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": lokasyon.ilce_adi,
        "addressRegion": lokasyon.il || "Muğla",
        "addressCountry": "TR"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": lokasyon.ilce_adi
    },
    "image": hizmet.cloudinary_url || hizmet.resim_url,
  };

  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${lokasyon.ilce_adi} ${hizmetAdi} Ürünleri`,
    "numberOfItems": urunler.length,
    "itemListElement": urunler.slice(0, 20).map((urun, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": urun.urun_adi || 'Ürün',
        "description": urun.aciklama || `${lokasyon.ilce_adi} bölgesinde ${urun.urun_adi}`,
        "brand": urun.marka ? {
          "@type": "Brand",
          "name": urun.marka
        } : undefined,
        "image": urun.cloudinary_url,
      }
    }))
  };

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Ana Sayfa', url: '/' },
          { name: 'Lokasyonlar', url: '/lokasyonlar' },
          { name: lokasyon.ilce_adi, url: `/lokasyonlar/${slug}` },
          { name: hizmetAdi, url: `/lokasyonlar/${slug}/hizmet/${hizmetSlug}` }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative h-80 bg-gradient-to-br from-blue-600 to-blue-800">
          {(hizmet.cloudinary_url || hizmet.resim_url) && (
            <Image
              src={hizmet.cloudinary_url || hizmet.resim_url || ''}
              alt={`${lokasyon.ilce_adi} ${hizmet.hizmet_adi}`}
              fill
              className="object-cover opacity-20"
              priority
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {lokasyon.ilce_adi} {hizmetAdi}
              </h1>
              <p className="text-xl md:text-2xl opacity-90">
                {lokasyon.il && `${lokasyon.il} | `}
                {urunler.length} Ürün ve Çözüm
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm">
            <ol className="flex flex-wrap items-center space-x-2 text-gray-600">
              <li><Link href="/" className="hover:text-blue-600">Ana Sayfa</Link></li>
              <li>/</li>
              <li><Link href="/lokasyonlar" className="hover:text-blue-600">Lokasyonlar</Link></li>
              <li>/</li>
              <li><Link href={`/lokasyonlar/${slug}`} className="hover:text-blue-600">{lokasyon.ilce_adi}</Link></li>
              <li>/</li>
              <li className="text-blue-600 font-medium">{hizmetAdi}</li>
            </ol>
          </nav>

          {/* Hizmet Açıklama */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {lokasyon.ilce_adi} Bölgesinde {hizmetAdi} Hizmeti
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                {hizmet.aciklama ||
                  `${lokasyon.ilce_adi} ve çevresinde profesyonel ${hizmetAdi.toLowerCase()} hizmeti sunuyoruz.
                  Uzman ekibimiz ve kaliteli ürünlerimizle kurulum, montaj, bakım ve servis desteği sağlıyoruz.`}
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center bg-white/60 rounded-lg p-4">
                  <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">Profesyonel Kurulum</div>
                    <div className="text-sm text-gray-600">Uzman ekip</div>
                  </div>
                </div>
                <div className="flex items-center bg-white/60 rounded-lg p-4">
                  <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">7/24 Destek</div>
                    <div className="text-sm text-gray-600">Acil müdahale</div>
                  </div>
                </div>
                <div className="flex items-center bg-white/60 rounded-lg p-4">
                  <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">Garanti</div>
                    <div className="text-sm text-gray-600">İşçilik & Malzeme</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ürünler */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              {lokasyon.ilce_adi} {hizmetAdi} Ürünlerimiz
            </h2>
            <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
              {lokasyon.ilce_adi} bölgesinde <strong>{hizmetAdi.toLowerCase()}</strong> için
              <strong> {urunler.length} farklı ürün</strong> ve çözüm sunuyoruz.
              Tüm ürünlerimiz kalite garantili olup profesyonel kurulum hizmeti ile birlikte sunulmaktadır.
            </p>

            {urunler.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {urunler.map((urun) => (
                  <div
                    key={urun.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                  >
                    {urun.cloudinary_url ? (
                      <div className="relative w-full h-48 bg-gray-100">
                        <Image
                          src={urun.cloudinary_url}
                          alt={urun.urun_adi || 'Ürün'}
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-2">
                        {urun.urun_adi || 'Ürün'}
                      </h3>
                      {urun.marka && (
                        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2 font-medium">
                          {urun.marka}
                        </div>
                      )}
                      {urun.kategori && (
                        <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mb-2 ml-1">
                          {urun.kategori}
                        </div>
                      )}
                      {urun.aciklama && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                          {urun.aciklama}
                        </p>
                      )}
                      <Link
                        href="/contact"
                        className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        Teklif Al
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 text-lg">Bu hizmet için henüz ürün eklenmemiş.</p>
                <Link
                  href="/contact"
                  className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Bilgi Al
                </Link>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {lokasyon.ilce_adi} {hizmetAdi} için Teklif Alın
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Uzman ekibimizle size en uygun çözümü sunmak için hazırız
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Hemen İletişime Geç
              </Link>
              <a
                href="tel:+902523134013"
                className="inline-block bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
              >
                📞 (252) 313 40 13
              </a>
            </div>
          </div>

          {/* Geri Dönüş Linkleri */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <Link
              href={`/lokasyonlar/${slug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {lokasyon.ilce_adi} Sayfasına Dön
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href={`/hizmetler/${hizmetSlug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              {hizmetAdi} Hakkında Detaylı Bilgi
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href="/lokasyonlar"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Tüm Lokasyonlar
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
