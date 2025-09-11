import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hizmetlerimiz | Gül-Tekin Mühendislik - Bodrum Mekanik Tesisat',
  description: 'Isı pompaları, güneş enerjisi, su arıtma, yerden ısıtma, klima sistemleri ve mekanik tesisat hizmetleri. Bodrum Yalıkavak bölgesinde profesyonel mühendislik çözümleri.',
  keywords: 'Bodrum ısı pompası, güneş enerjisi sistemleri, su arıtma, yerden ısıtma, VRF klima, hidrofor, sulama sistemleri, mekanik tesisat, termosifonik sistem, radyatör',
  openGraph: {
    title: 'Hizmetlerimiz | Gül-Tekin Mühendislik',
    description: 'Enerji verimli ve çevre dostu mühendislik çözümleri. Isıtma, soğutma, su arıtma ve enerji sistemleri.',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Gül-Tekin Mühendislik',
  },
  alternates: {
    canonical: '/services',
  },
};

export default function ServicesPage() {
  const services = [
    {
      title: "Isı Pompaları",
      description: "Enerji verimli ısıtma ve soğutma çözümleri",
      icon: "🌡️"
    },
    {
      title: "Güneş Enerjisi Sistemleri",
      description: "Fotovoltaik panel ve solar çözümler",
      icon: "☀️"
    },
    {
      title: "Su Arıtma Sistemleri",
      description: "Ters osmoz ve filtreleme sistemleri",
      icon: "💧"
    },
    {
      title: "Yerden Isıtma",
      description: "Radyant ısıtma sistemleri kurulumu",
      icon: "🏠"
    },
    {
      title: "Hidrofor Sistemleri",
      description: "Su depoları ve basınç sistemleri",
      icon: "🔧"
    },
    {
      title: "Klima Sistemleri",
      description: "VRF ve inverter klima çözümleri",
      icon: "❄️"
    },
    {
      title: "Sulama Sistemleri",
      description: "Damla sulama ve otomasyon sistemleri",
      icon: "🌿"
    },
    {
      title: "Mekanik Sıhhi Tesisat",
      description: "Komple tesisat çözümleri",
      icon: "🔩"
    },
    {
      title: "Termosifonik Sistemler",
      description: "Güneş enerjili su ısıtma sistemleri",
      icon: "🌅"
    },
    {
      title: "Radyatör Sistemleri",
      description: "Merkezi ve bireysel ısıtma çözümleri",
      icon: "🔥"
    },
    {
      title: "Pompa Sistemleri",
      description: "Endüstriyel ve ev tipi pompa çözümleri",
      icon: "♾️"
    },
    {
      title: "Akıllı Oda Termostatları",
      description: "IoT destekli ısı kontrol sistemleri",
      icon: "📱"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Hizmetlerimiz
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Bodrum/Yalıkavak bölgesinde kaliteli mühendislik hizmetleri sunuyoruz.
          Enerji verimliliği ve sürdürülebilirlik ilkeleriyle çalışıyoruz.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Neden Bizi Seçmelisiniz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-8">
            <div>
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold mb-2">Uzman Kadro</h3>
              <p className="text-gray-600 text-sm">Alanının uzman mühendisleri ile profesyonel hizmet</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold mb-2">Garantili Çözümler</h3>
              <p className="text-gray-600 text-sm">Tüm işlerimizde garanti ve sonrası destek</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="font-semibold mb-2">Çevre Dostu</h3>
              <p className="text-gray-600 text-sm">Sürdürülebilir ve enerji verimli çözümler</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}