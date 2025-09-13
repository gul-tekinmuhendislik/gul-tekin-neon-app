import { Metadata } from 'next';
import TeamExperts from '@/components/TeamExperts';
import ProjectPortfolioServer from '@/components/ProjectPortfolioServer';
import Testimonials from '@/components/Testimonials';
import WebPages from '@/components/WebPages';
import ProjectStatisticsServer from '@/components/ProjectStatisticsServer';
import { TextFlip } from '@/components/ui/text-flip';
import { getRandomBrands } from '@/lib/get-brands';

export const metadata: Metadata = {
  title: 'Hakkımızda | Gül-Tekin Mühendislik - Mekanik Tesisat',
  description: 'Muğla bölgesinde mekanik tesisat ve enerji verimliliği uzmanı. 20+ yıl deneyim, 500+ tamamlanmış proje. Solimpeks yetkili servisi.',
  keywords: 'mühendislik, mekanik tesisat, ısı pompası uzmanı, güneş enerjisi sistemleri, su arıtma, yerden ısıtma, Solimpeks yetkili servis, Muğla, Bodrum, Yalıkavak',
  openGraph: {
    title: 'Hakkımızda | Gül-Tekin Mühendislik - 20+ Yıl Deneyim',
    description: 'Muğla bölgesinde mekanik tesisat ve enerji sistemleri alanında uzman mühendislik hizmetleri. 500+ başarılı proje, %98 müşteri memnuniyeti.',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Gül-Tekin Mühendislik',
    images: [{
      url: '/logo.png',
      width: 1200,
      height: 630,
      alt: 'Gül-Tekin Mühendislik'
    }]
  },
  alternates: {
    canonical: '/about',
  },
};

export default async function AboutPage() {
  const brandNames = await getRandomBrands(6);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://ai.gul-tekinmuhendislik.com/#business",
        "name": "Gül-Tekin Mühendislik",
        "description": "Muğla bölgesinde mekanik tesisat sistemleri ve enerji verimliliği çözümleri",
        "url": "https://ai.gul-tekinmuhendislik.com",
        "telephone": "+90 252 386 35 54",
        "email": "info@gul-tekinmuhendislik.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Gökçebel Mahallesi İnönü Caddesi 61/D",
          "addressLocality": "Yalıkavak",
          "addressRegion": "Muğla",
          "postalCode": "48990",
          "addressCountry": "TR"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "37.1039",
          "longitude": "27.2892"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday"
            ],
            "opens": "08:00",
            "closes": "18:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "09:00",
            "closes": "14:00"
          }
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "500",
          "bestRating": "5"
        },
        "priceRange": "₺₺₺",
        "paymentAccepted": "Cash, Credit Card, Bank Transfer",
        "currenciesAccepted": "TRY",
        "areaServed": [
          {
            "@type": "City",
            "name": "Bodrum"
          },
          {
            "@type": "City",
            "name": "Milas"
          }
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Mühendislik Hizmetleri",
          "itemListElement": [
            {
              "@type": "Service",
              "name": "Isı Pompası Kurulumu",
              "description": "Enerji verimli ısı pompası sistemleri kurulumu ve bakımı"
            },
            {
              "@type": "Service",
              "name": "Güneş Enerjisi Sistemleri",
              "description": "Fotovoltaik panel ve solar çözümler"
            },
            {
              "@type": "Service",
              "name": "Su Arıtma Sistemleri",
              "description": "Ters osmoz ve filtreleme sistemleri"
            }
          ]
        },
        "founder": {
          "@type": "Person",
          "name": "Yusuf Gültekin",
          "jobTitle": "Kurucu",
          "alumniOf": ""
        },
        "foundingDate": "2000",
        "numberOfEmployees": {
          "@type": "QuantitativeValue",
          "value": 25
        }
      },
      {
        "@type": "ProfessionalService",
        "name": "Gül-Tekin Mühendislik",
        "serviceType": "Mekanik Tesisat ve Enerji Sistemleri",
        "provider": {
          "@id": "https://ai.gul-tekinmuhendislik.com/#business"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://ai.gul-tekinmuhendislik.com/#organization",
        "name": "Gül-Tekin Mühendislik",
        "legalName": "GÜL-TEKİN SIHHİ TESİSAT, MÜHENDİSLİK, İNŞAAT, TAAHÜT, EMLAK, TURİZM, ENERJİ KAYNAKLARI, GIDA, İTHALAT İHRACAT TİCARET VE SANAYİ LİMİTED ŞİRKETİ",
        "sameAs": [
          "https://www.facebook.com/gultekinbodrum",
          "https://www.instagram.com/gultekinmuhendislik48/",
          "https://wa.me/905323177859"
        ],
        "logo": {
          "@type": "ImageObject",
          "url": "https://ai.gul-tekinmuhendislik.com/logo.png",
          "width": 200,
          "height": 50
        },
        "award": [
          "TSE Hizmet Yeri Yeterlilik Belgesi",
          "CE Uygunluk Sertifikası"
        ],
        "memberOf": []
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Hakkımızda
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Biz Kimiz Ne Yaparız?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>GÜL-TEKİN SIHHİ TESİSAT, MÜHENDİSLİK, İNŞAAT, TAAHÜT, EMLAK, TURİZM, ENERJİ KAYNAKLARI,
              GIDA, İTHALAT İHRACAT TİCARET VE SANAYİ LİMİTED ŞİRKETİ</strong> olarak, 2000 yılından bu yana
              Bodrum Yalıkavak&apos;ta, Muğla bölgesi ve özellikle Bodrum Yarımadası&apos;nda müşterilerimize kaliteli hizmet sunmaktayız.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Gültekin Mühendislik olarak, su teknolojileri ve tesisat sektöründe yenilikçi, güvenilir ve kaliteli
              çözümler sunmanın yanı sıra, gelişen enerji ihtiyaçlarına da sürdürülebilir ve çevre dostu alternatifler
              getiriyoruz. Uzman ekibimiz ve yıllara dayanan tecrübemizle, bireysel ve endüstriyel müşterilerimizin
              tüm ihtiyaçlarına profesyonel yaklaşımımızla cevap veriyoruz.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Su Teknolojileri ve Tesisat Çözümleri</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ürün portföyümüzde; su sayaçları, hidrofor sistemleri, su depoları, arıtma sistemleri, sulama ekipmanları,
              filtreler ve yerden ısıtma sistemleri gibi geniş bir yelpazede, sektörün önde gelen markalarını bir araya getiriyoruz.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-lg mb-2">Hidrofor Sistemleri</h4>
                <p className="text-gray-600"><strong>Aldea hidroforlar</strong>, <strong>Wepomp</strong> ve <strong>Wilso</strong> markalarıyla,
                su basınçlandırma ve su temini konusunda yüksek performans ve güvenilirlik sunuyoruz.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-lg mb-2">Isı Pompası ve Su Deposu</h4>
                <p className="text-gray-600"><strong>Solimpeks</strong>, <strong>Varmeks</strong> ve <strong>Makse</strong> markalarının
                ısı pompası ve su deposu modelleriyle, müşterilerimize enerji verimliliği ve uzun ömürlü çözümler sağlıyoruz.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Güçlü Markalarımız</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-blue-600 text-xl mr-3">●</span>
                <div>
                  <h4 className="font-semibold">Solimpeks</h4>
                  <p className="text-gray-600">Yenilikçi ısı pompası ve güneş enerjisi sistemleriyle, enerji tasarrufu ve çevre dostu çözümler.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 text-xl mr-3">●</span>
                <div>
                  <h4 className="font-semibold">Varmeks</h4>
                  <p className="text-gray-600">Dayanıklı ve yüksek performanslı ısı pompası ve su deposu modelleri.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-purple-600 text-xl mr-3">●</span>
                <div>
                  <h4 className="font-semibold">Makse</h4>
                  <p className="text-gray-600">Modern teknolojisiyle, hem konut hem de endüstriyel projelerde yüksek verimlilik.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-orange-600 text-xl mr-3">●</span>
                <div>
                  <h4 className="font-semibold">Aldea</h4>
                  <p className="text-gray-600">Güçlü ve sessiz çalışan hidrofor sistemleriyle, su basınçlandırmada lider marka.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-red-600 text-xl mr-3">●</span>
                <div>
                  <h4 className="font-semibold">Wepomp & Wilso</h4>
                  <p className="text-gray-600">Su teknolojileri ve hidrofor sistemlerinde güvenilir ve yenilikçi çözümler.</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-indigo-600 text-xl mr-3">●</span>
                <div>
                  <p className="text-gray-700">Ve daha fazlası:{" "}
                  <TextFlip
                    words={brandNames}
                    duration={3500}
                    randomCount={6}
                    className="text-blue-600 font-bold inline-flex"
                  />
                  {" "}gibi sektörün lider markalarının yetkili servisi ve çözüm ortağıyız.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Alternatif Enerji Sistemleri</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Güneş enerjisiyle elektrik üretimi sağlayan fotovoltaik (PV) panel sistemleri ve yüksek verimli
              ısı pompası teknolojileriyle, hem enerji tasarrufu hem de çevreye duyarlı çözümler sunuyoruz.
              Anahtar teslim projelerimizle, konutlardan endüstriyel tesislere kadar her ölçekte,
              yenilenebilir enerjiye geçişinizi güvenle gerçekleştiriyoruz.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Isı pompalarından güneş enerjisi sistemlerine, su arıtma çözümlerinden yerden ısıtma sistemlerine kadar geniş bir yelpazede,
              <strong>enerji verimliliği odaklı</strong> ve <strong>çevre dostu</strong> profesyonel hizmet sunuyoruz.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Hizmet Anlayışımız</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Endüstriyel tesislerden konut projelerine, tarımsal sulamadan su arıtma ve enerji sistemlerine
              kadar farklı alanlarda; yüksek verimlilik, enerji tasarrufu ve uzun ömürlü kullanım sunan
              çözümlerimizle, müşterilerimizin memnuniyetini her zaman ön planda tutuyoruz.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Satış öncesi danışmanlık, projelendirme, satış sonrası teknik destek ve bakım hizmetlerimizle,
              iş ortaklarımıza ve müşterilerimize tam kapsamlı bir hizmet sunuyoruz.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Gelişen teknolojiyi yakından takip ederek, sürdürülebilir ve çevre dostu ürünlerle sektörde
              fark yaratmaya devam ediyoruz. Gültekin Mühendislik olarak, güvenilir iş ortaklığı, kaliteli
              ürün ve hizmet anlayışımızla, suya, enerjiye ve hayata değer katmak için çalışıyoruz.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
              Siz de suyun ve enerjinin olduğu her yerde, doğru çözüm ve güvenilir hizmet için bize ulaşabilirsiniz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                Vizyonumuz
              </h3>
              <p className="text-gray-600">
                Enerji verimliliği ve çevresel sürdürülebilirlik ilkeleri doğrultusunda,
                bölgemizin lider mühendislik firması olmak.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-3">💡</span>
                Misyonumuz
              </h3>
              <p className="text-gray-600">
                Müşterilerimize kaliteli, güvenilir ve uygun maliyetli çözümler sunarak,
                yaşam kalitelerini artırmak ve enerji tasarrufu sağlamak.
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Neden Biz?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <span className="text-green-600 text-xl mr-3">✓</span>
                <div>
                  <h4 className="font-semibold mb-1">Uzman Kadro</h4>
                  <p className="text-gray-600 text-sm">Alanında uzman mühendis ve teknisyen ekibi</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 text-xl mr-3">✓</span>
                <div>
                  <h4 className="font-semibold mb-1">Kaliteli Markalar</h4>
                  <p className="text-gray-600 text-sm">Sektörün önde gelen markalarıyla güvenilir ortaklık</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 text-xl mr-3">✓</span>
                <div>
                  <h4 className="font-semibold mb-1">Garanti ve Destek</h4>
                  <p className="text-gray-600 text-sm">Tüm işlerimizde garanti ve satış sonrası destek</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 text-xl mr-3">✓</span>
                <div>
                  <h4 className="font-semibold mb-1">Yerel Deneyim</h4>
                  <p className="text-gray-600 text-sm">Muğla bölgesinde yıllardır hizmet</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold mb-4">İletişim</h3>
            <div className="space-y-3">
              <p className="flex items-center text-gray-700">
                <span className="text-xl mr-3">📍</span>
                Gökçebel Mahallesi İnönü Caddesi 61/D Yalıkavak/MUĞLA
              </p>
              <p className="flex items-center text-gray-700">
                <span className="text-xl mr-3">📞</span>
                0252 386 35 54 | 0532 317 78 59
              </p>
              <p className="flex items-center text-gray-700">
                <span className="text-xl mr-3">✉️</span>
                info@gul-tekinmuhendislik.com
              </p>
              <p className="flex items-center text-gray-700">
                <span className="text-xl mr-3">🌐</span>
                ai.gul-tekinmuhendislik.com
              </p>
              <p className="flex items-center text-gray-700">
                <span className="text-xl mr-3">⏰</span>
                Pazartesi-Cuma: 08:00-18:00 | Cumartesi: 09:00-14:00
              </p>
              <p className="flex items-center text-gray-700 font-semibold text-green-600">
                <span className="text-xl mr-3">🚨</span>
                7/24 Acil Servis Hattı: 0532 317 78 59
              </p>
            </div>
          </div>

        </div>

        {/* Proje İstatistikleri */}
        <ProjectStatisticsServer />

        {/* E-E-A-T Components */}
        <TeamExperts />
        <ProjectPortfolioServer />
        <WebPages />
        <Testimonials />
      </div>
    </div>
    </>
  );
}