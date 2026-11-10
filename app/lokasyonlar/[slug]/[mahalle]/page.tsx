import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  validateMetaDescription,
  validateAltText,
  createTitle,
} from "@/lib/seo-utils";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import {
  getAllLokasyonlar,
  getAllMahalleler,
  getAllHizmetler,
  getAllUrunler,
  type Lokasyon,
  type Mahalle,
  type Hizmet,
  type Urun,
} from "@/lib/static-data";

export const revalidate = 3600;

interface MahallePageProps {
  params: { slug: string; mahalle: string };
}

function findLokasyonBySlug(slug: string): Lokasyon | null {
  const lokasyonlar = getAllLokasyonlar();
  return lokasyonlar.find((l) => l.slug === slug) || null;
}

function findMahalleBySlug(
  ilceId: number,
  mahalleSlug: string
): Mahalle | null {
  const mahalleler = getAllMahalleler();
  return mahalleler.find((m) => m.ilce_id === ilceId && m.slug === mahalleSlug) || null;
}

export async function generateStaticParams() {
  const lokasyonlar = getAllLokasyonlar();
  return getAllMahalleler().flatMap((m) => {
    const lokasyon = lokasyonlar.find((l) => l.id === m.ilce_id);
    return lokasyon?.slug && m.slug
      ? [{ slug: lokasyon.slug, mahalle: m.slug }]
      : [];
  });
}

export async function generateMetadata({
  params,
}: MahallePageProps) {
  const { slug, mahalle: mahalleSlug } = params;
  const lokasyon = findLokasyonBySlug(slug) as Lokasyon | null;

  if (!lokasyon) {
    return {
      title: "Mahalle Bulunamadı",
      description: "Aradığınız mahalle bulunamadı.",
    };
  }

  const mahalle = findMahalleBySlug(lokasyon.id, mahalleSlug) as Mahalle | null;

  if (!mahalle) {
    return {
      title: "Mahalle Bulunamadı",
      description: "Aradığınız mahalle bulunamadı.",
    };
  }

  return {
    title: createTitle(`${mahalle.mahalle_adi} ${lokasyon.ilce_adi} Tesisat`),
    description: validateMetaDescription(
      mahalle.aciklama || undefined,
      `${lokasyon.ilce_adi} ${mahalle.mahalle_adi}'nde su deposu, hidrofor, ısı pompası ve tesisat hizmetleri. Profesyonel kurulum ve servis.`,
      `${mahalle.mahalle_adi} ${lokasyon.ilce_adi}`
    ),
    alternates: {
      canonical: `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/${mahalleSlug}`,
      languages: {
        "tr-TR": `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/${mahalleSlug}`,
        "x-default": `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/${mahalleSlug}`,
      },
    },
    openGraph: {
      title: `${mahalle.mahalle_adi} ${lokasyon.ilce_adi} - Gül-Tekin Mühendislik`,
      description: mahalle.aciklama || `${lokasyon.ilce_adi} ${mahalle.mahalle_adi}'nde mühendislik hizmetleri`,
      url: `https://gul-tekinmuhendislik.com/lokasyonlar/${slug}/${mahalleSlug}`,
    },
  };
}

export default function MahallePage({
  params,
}: MahallePageProps) {
  const { slug, mahalle: mahalleSlug } = params;
  const lokasyon = findLokasyonBySlug(slug) as Lokasyon | null;

  if (!lokasyon) {
    notFound();
  }

  const mahalle = findMahalleBySlug(lokasyon.id, mahalleSlug) as Mahalle | null;

  if (!mahalle) {
    notFound();
  }

  const hizmetler = getAllHizmetler() as Hizmet[];
  const allUrunler = getAllUrunler() as Urun[];

  const hizmetlerWithUrunler = hizmetler.map((hizmet) => {
    const urunlerForHizmet = allUrunler.filter((u) => u.hizmet_id === hizmet.id);
    return { ...hizmet, urunler: urunlerForHizmet };
  });

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Gül-Tekin Mühendislik - ${mahalle.mahalle_adi} ${lokasyon.ilce_adi}`,
    description: mahalle.aciklama || `${lokasyon.ilce_adi} ${mahalle.mahalle_adi}'nde mühendislik hizmetleri`,
    address: {
      "@type": "PostalAddress",
      streetAddress: mahalle.mahalle_adi,
      addressLocality: lokasyon.ilce_adi,
      addressRegion: lokasyon.il || "Muğla",
      addressCountry: "TR",
    },
  };

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Ana Sayfa", url: "/" },
          { name: "Lokasyonlar", url: "/lokasyonlar" },
          { name: lokasyon.ilce_adi, url: `/lokasyonlar/${slug}` },
          { name: mahalle.mahalle_adi, url: `/lokasyonlar/${slug}/${mahalleSlug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <nav className="mb-8 text-sm">
            <ol className="flex items-center flex-wrap space-x-2 text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600">
                  Ana Sayfa
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/lokasyonlar" className="hover:text-blue-600">
                  Lokasyonlar
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/lokasyonlar/${slug}`} className="hover:text-blue-600">
                  {lokasyon.ilce_adi}
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium">
                {mahalle.mahalle_adi}
              </li>
            </ol>
          </nav>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {mahalle.mahalle_adi}, {lokasyon.ilce_adi}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              {mahalle.aciklama || `${lokasyon.ilce_adi} ${mahalle.mahalle_adi}'nde profesyonel su sistemleri kurulumu ve bakım hizmetleri sunuyoruz.`}
            </p>
            {mahalle.proje_sayisi && mahalle.proje_sayisi > 0 && (
              <p className="text-lg text-blue-600 mt-4 font-semibold">
                {mahalle.proje_sayisi} proje tamamlandı
              </p>
            )}
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {mahalle.mahalle_adi}'nde Sunduğumuz Hizmetler
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hizmetlerWithUrunler.map((hizmet) => (
                <Link
                  key={hizmet.id}
                  href={`/hizmetler/${hizmet.slug || hizmet.id}`}
                >
                  <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {(hizmet.cloudinary_url || hizmet.resim_url) ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={hizmet.cloudinary_url || hizmet.resim_url || ""}
                          alt={validateAltText(
                            hizmet.hizmet_adi || undefined,
                            (hizmet.cloudinary_url || hizmet.resim_url || "").split("/").pop() || "hizmet",
                            `${mahalle.mahalle_adi} ${hizmet.hizmet_adi}`
                          )}
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
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            Öne Çıkan Ürünler:
                          </h4>
                          <div className="space-y-1">
                            {hizmet.urunler.slice(0, 5).map((urun) => (
                              <div key={urun.id} className="flex items-center text-xs text-gray-600">
                                {urun.cloudinary_url && (
                                  <Image
                                    src={urun.cloudinary_url as string}
                                    alt={validateAltText(
                                      urun.urun_adi || undefined,
                                      urun.cloudinary_url?.split("/").pop() || "urun",
                                      `${urun.urun_adi} ürünü`
                                    )}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Deneyimli Ekip
                  </h3>
                  <p className="text-gray-600">
                    Yılların deneyimiyle profesyonel hizmet
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Hızlı Hizmet
                  </h3>
                  <p className="text-gray-600">
                    Acil durumlarda hızlı müdahale
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Kaliteli Malzeme
                  </h3>
                  <p className="text-gray-600">
                    Güvenilir markalarla çalışıyoruz
                  </p>
                </div>
              </div>
            </div>
          </div>

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
                href="tel:+902523863554"
                className="inline-block bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
              >
                02523863554
              </a>
            </div>
          </div>

          <div className="mt-16 flex justify-between items-center">
            <Link
              href={`/lokasyonlar/${slug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
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
