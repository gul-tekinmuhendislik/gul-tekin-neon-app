export default function WebPages() {
  const webPages = [
    {
      href: "https://bodrum-hidrofor.gul-tekinmuhendislik.com",
      icon: "💧",
      title: "Bodrum Hidrofor",
      description: "Hidrofor sistemleri ve su basınçlandırma"
    },
    {
      href: "https://yalikavak.gul-tekinmuhendislik.com",
      icon: "🏖️",
      title: "Yalıkavak",
      description: "Yalıkavak bölgesi özel hizmetler"
    },
    {
      href: "https://bodrum.gul-tekinmuhendislik.com",
      icon: "🌊",
      title: "Bodrum",
      description: "Bodrum geneli mühendislik hizmetleri"
    },
    {
      href: "https://su-deposu.gul-tekinmuhendislik.com",
      icon: "🏗️",
      title: "Su Deposu",
      description: "Su depolama sistemleri ve tanklar"
    },
    {
      href: "https://isi-pompasi.gul-tekinmuhendislik.com",
      icon: "🔥",
      title: "Isı Pompası",
      description: "Enerji verimli ısıtma ve soğutma"
    },
    {
      href: "https://yerden-isitma.gul-tekinmuhendislik.com",
      icon: "♨️",
      title: "Yerden Isıtma",
      description: "Konforlu yerden ısıtma sistemleri"
    },
    {
      href: "https://gunes-enerjisi.gul-tekinmuhendislik.com",
      icon: "☀️",
      title: "Güneş Enerjisi",
      description: "Solar panel ve güneş enerjisi sistemleri"
    },
    {
      href: "https://gultekinmuhendislik.substack.com",
      icon: "📝",
      title: "Blog & Haberler",
      description: "Sektörel gelişmeler ve teknik yazılar"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Web Sayfalarımız
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hizmetlerimiz hakkında detaylı bilgi almak için özel web sayfalarımızı ziyaret edebilirsiniz
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {webPages.map((page, index) => (
              <a
                key={index}
                href={page.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {page.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {page.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {page.description}
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}