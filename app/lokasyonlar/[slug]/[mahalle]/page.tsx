import { sql } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export const revalidate = 3600;

interface MahallePageProps {
  params: Promise<{
    slug: string;
    mahalle: string;
  }>;
}

interface Mahalle {
  id: number;
  mahalle_adi: string;
  slug: string;
  aciklama?: string;
  proje_sayisi?: number;
  ilce_id: number;
}

interface Lokasyon {
  id: number;
  ilce_adi: string;
  slug: string;
  il?: string;
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

async function getMahalleData(ilceSlug: string, mahalleSlug: string) {
  try {
    // İlçeyi bul
    const [lokasyon] = await sql<Lokasyon[]>`
      SELECT id, ilce_adi, slug, il
      FROM hizmet_lokasyonlari
      WHERE slug = ${ilceSlug} AND aktif = true
    `;

    if (!lokasyon) {
      return null;
    }

    // Mahalleyi bul
    const [mahalle] = await sql<Mahalle[]>`
      SELECT id, mahalle_adi, slug, aciklama, proje_sayisi, ilce_id
      FROM mahalleler
      WHERE ilce_id = ${lokasyon.id} AND slug = ${mahalleSlug}
    `;

    if (!mahalle) {
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

    return {
      mahalle,
      lokasyon,
      hizmetler
    };
  } catch (error) {
    console.error('Mahalle detayı alınırken hata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: MahallePageProps) {
  const { slug, mahalle: mahalleSlug } = await params;
  const data = await getMahalleData(slug, mahalleSlug);

  if (!data) {
    return {
      title: 'Mahalle Bulunamadı',
      description: 'Aradığınız mahalle bulunamadı.'
    };
  }

  const { mahalle, lokasyon } = data;

  return {
    title: `${mahalle.mahalle_adi} ${lokasyon.ilce_adi} - Su Deposu, Hidrofor, Pompa | Gül-Tekin Mühendislik`,
    description: mahalle.aciklama || `${lokasyon.ilce_adi} ${mahalle.mahalle_adi}'nde su deposu, hidrofor, ısı pompası ve tesisat hizmetleri. Profesyonel kurulum ve servis.`,
    alternates: {
      canonical: `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/${mahalleSlug}`,
    },
    openGraph: {
      title: `${mahalle.mahalle_adi} ${lokasyon.ilce_adi} - Gül-Tekin Mühendislik`,
      description: mahalle.aciklama || `${lokasyon.ilce_adi} ${mahalle.mahalle_adi}'nde mühendislik hizmetleri`,
      url: `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/${mahalleSlug}`,
    }
  };
}

export default async function MahallePage({ params }: MahallePageProps) {
  const { slug, mahalle: mahalleSlug } = await params;
  const data = await getMahalleData(slug, mahalleSlug);

  if (!data) {
    notFound();
  }

  const { mahalle, lokasyon, hizmetler } = data;

  // Schema markup
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
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": mahalle.mahalle_adi,
        "item": `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/${mahalleSlug}`
      }
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Gül-Tekin Mühendislik - ${mahalle.mahalle_adi} ${lokasyon.ilce_adi}`,
    "description": mahalle.aciklama || `${lokasyon.ilce_adi} ${mahalle.mahalle_adi}'nde mühendislik hizmetleri`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": mahalle.mahalle_adi,
      "addressLocality": lokasyon.ilce_adi,
      "addressRegion": lokasyon.il || "Muğla",
      "addressCountry": "TR"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm">
            <ol className="flex items-center flex-wrap space-x-2 text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/lokasyonlar" className="hover:text-blue-600">Lokasyonlar</Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/lokasyonlar/${slug}`} className="hover:text-blue-600">
                  {lokasyon.ilce_adi}
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium">{mahalle.mahalle_adi}</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {mahalle.mahalle_adi}, {lokasyon.ilce_adi}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              {mahalle.aciklama || `${lokasyon.ilce_adi} ${mahalle.mahalle_adi}'nde profesyonel su sistemleri kurulumu ve bakım hizmetleri sunuyoruz.`}
            </p>
            {mahalle.proje_sayisi !== undefined && mahalle.proje_sayisi > 0 && (
              <p className="text-lg text-blue-600 mt-4 font-semibold">
                {mahalle.proje_sayisi} proje tamamlandı
              </p>
            )}
          </div>

          {/* Hizmetler */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {mahalle.mahalle_adi}'nde Sunduğumuz Hizmetler
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
          </div>

          {/* Neden Biz */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Neden Gül-Tekin Mühendislik?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Deneyimli Ekip</h3>
                  <p className="text-gray-600">Yılların deneyimiyle profesyonel hizmet</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Hızlı Hizmet</h3>
                  <p className="text-gray-600">Acil durumlarda hızlı müdahale</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Kaliteli Malzeme</h3>
                  <p className="text-gray-600">Güvenilir markalarla çalışıyoruz</p>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {mahalle.mahalle_adi}'nde Hizmet İçin İletişime Geçin
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
              <a
                href="tel:+902522117171"
                className="inline-block bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
              >
                (0252) 211 71 71
              </a>
            </div>
          </div>

          {/* Back Links */}
          <div className="mt-16 flex justify-between items-center">
            <Link
              href={`/lokasyonlar/${slug}`}
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
              {lokasyon.ilce_adi} Sayfasına Dön
            </Link>
            <Link
              href="/lokasyonlar"
              className="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium"
            >
              Tüm Lokasyonlar
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
