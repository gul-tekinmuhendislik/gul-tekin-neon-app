import { Metadata } from 'next';
import TeamExperts from '@/components/TeamExperts';
import ProjectPortfolio from '@/components/ProjectPortfolio';
import Testimonials from '@/components/Testimonials';

export const metadata: Metadata = {
  title: 'Hakkımızda | Gül-Tekin Mühendislik - Bodrum Mekanik Tesisat',
  description: 'Bodrum Yalıkavak merkezli mekanik tesisat ve enerji verimliliği uzmanı. 20+ yıl deneyim, 500+ tamamlanmış proje. ISO 9001 sertifikalı, Alarko, Baymak, Demirdöküm yetkili servisi.',
  keywords: 'Bodrum mühendislik, Yalıkavak mekanik tesisat, ısı pompası uzmanı, güneş enerjisi sistemleri, su arıtma, yerden ısıtma, Alarko yetkili servis, Baymak yetkili servis, Demirdöküm yetkili servis, ISO 9001 sertifikalı',
  openGraph: {
    title: 'Hakkımızda | Gül-Tekin Mühendislik - 20+ Yıl Deneyim',
    description: 'Bodrum bölgesinde mekanik tesisat ve enerji sistemleri alanında uzman mühendislik hizmetleri. 500+ başarılı proje, %98 müşteri memnuniyeti.',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Gül-Tekin Mühendislik',
    images: [{
      url: '/logo.png',
      width: 1200,
      height: 630,
      alt: 'Gül-Tekin Mühendislik - Bodrum'
    }]
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://gul-tekinmuhendislik.com/#business",
        "name": "Gül-Tekin Mühendislik",
        "description": "Bodrum ve Milas bölgesinde mekanik tesisat sistemleri ve enerji verimliliği çözümleri",
        "url": "https://gul-tekinmuhendislik.com",
        "telephone": "+90 252 386 35 54",
        "email": "info@gul-tekinmuhendislik.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Gökçebel Mahallesi İnönü Caddesi 61/D",
          "addressLocality": "Yalıkavak, Bodrum",
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
          "name": "Murat Gül",
          "jobTitle": "Kurucu & Baş Mühendis",
          "alumniOf": "İstanbul Teknik Üniversitesi"
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
          "@id": "https://gul-tekinmuhendislik.com/#business"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://gul-tekinmuhendislik.com/#organization",
        "name": "Gül-Tekin Mühendislik",
        "legalName": "Gül-Tekin Mühendislik San. ve Tic. Ltd. Şti.",
        "sameAs": [
          "https://www.facebook.com/gultekinbodrum",
          "https://www.instagram.com/gultekinmuhendislik48/",
          "https://wa.me/905323177859"
        ],
        "logo": {
          "@type": "ImageObject",
          "url": "https://gul-tekinmuhendislik.com/logo.png",
          "width": 200,
          "height": 50
        },
        "award": [
          "ISO 9001:2015 Kalite Yönetim Sistemi Sertifikası",
          "TSE Hizmet Yeri Yeterlilik Belgesi",
          "CE Uygunluk Sertifikası"
        ],
        "memberOf": [
          {
            "@type": "Organization",
            "name": "TMMOB Makina Mühendisleri Odası"
          }
        ]
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
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Gül-Tekin Mühendislik - 20+ Yıllık Güven</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>2000 yılından beri</strong> Bodrum/Yalıkavak merkezli olarak faaliyet gösteren firmamız, mekanik tesisat sistemleri ve 
              enerji verimliliği alanında uzmanlaşmış, <strong>ISO 9001:2015 sertifikalı</strong> bir mühendislik şirketidir. 
              <strong>500'den fazla başarıyla tamamlanmış proje</strong> ve <strong>%98 müşteri memnuniyeti oranı</strong> ile 
              bölgenin en güvenilir çözüm ortağı olarak hizmet vermekteyiz.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Uzman mühendis kadromuz, <strong>İTÜ, ODTÜ, YTÜ ve Boğaziçi Üniversitesi</strong> gibi Türkiye'nin önde gelen 
              teknik üniversitelerinden mezun, alanında sertifikalı profesyonellerden oluşmaktadır. <strong>Alarko, Baymak, 
              Demirdöküm, Daikin, Mitsubishi</strong> gibi sektörün lider markalarının yetkili servisi olarak, en kaliteli 
              ürün ve hizmetleri sunuyoruz.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Isı pompalarından güneş enerjisi sistemlerine, su arıtma çözümlerinden yerden ısıtma 
              sistemlerine kadar geniş bir yelpazede, <strong>enerji verimliliği odaklı</strong> ve <strong>çevre dostu</strong> 
              profesyonel hizmet sunuyoruz. Projelerimizde ortalama <strong>%45 enerji tasarrufu</strong> sağlıyoruz.
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
                  <p className="text-gray-600 text-sm">Alarko, Baymak, Demirdöküm, Grundfos gibi lider markalar</p>
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
                  <p className="text-gray-600 text-sm">Bodrum bölgesinde yıllardır hizmet</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold mb-4">İletişim</h3>
            <div className="space-y-3">
              <p className="flex items-center text-gray-700">
                <span className="text-xl mr-3">📍</span>
                Gökçebel Mahallesi İnönü Caddesi 61/D Yalıkavak, Bodrum/MUĞLA
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
                yalikavak.gul-tekinmuhendislik.com
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
        
        {/* E-E-A-T Components */}
        <TeamExperts />
        <ProjectPortfolio />
        <Testimonials />
      </div>
    </div>
    </>
  );
}