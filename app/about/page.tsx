export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Hakkımızda
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-gray-200 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">Gül-Tekin Mühendislik</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bodrum/Yalıkavak merkezli olarak faaliyet gösteren firmamız, mekanik tesisat sistemleri ve 
              enerji verimliliği alanında uzmanlaşmış bir mühendislik şirketidir. Yılların getirdiği 
              deneyim ve bilgi birikimi ile bölgenin güvenilir çözüm ortağı olarak hizmet vermekteyiz.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Isı pompalarından güneş enerjisi sistemlerine, su arıtma çözümlerinden yerden ısıtma 
              sistemlerine kadar geniş bir yelpazede profesyonel hizmet sunuyoruz.
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
                <span className="text-xl mr-3">🌐</span>
                yalikavak.gul-tekinmuhendislik.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}