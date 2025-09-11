import { Metadata } from 'next';
import { getHizmetlerFromNeon } from '@/lib/airtable-hizmetler-client';
import { Hizmet } from '@/lib/types/hizmet';
import Image from 'next/image';

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
    canonical: '/hizmetler',
  },
};

export default async function HizmetlerPage() {
  const hizmetler = await getHizmetlerFromNeon() as Hizmet[];

  // Group services by category
  const groupedServices = hizmetler.reduce((acc: Record<string, Hizmet[]>, hizmet) => {
    const kategori = hizmet.kategori || 'Diğer';
    if (!acc[kategori]) {
      acc[kategori] = [];
    }
    acc[kategori].push(hizmet);
    return acc;
  }, {});

  const categoryIcons: { [key: string]: string } = {
    'MEKANİK SIHHİ TESİSAT': '🔧',
    'ALTERNATİF ENERJİ SİSTEMLERİ': '⚡',
    'SU ARITMA SİSTEMLERİ': '💧',
    'ISITMA SOĞUTMA SİSTEMLERİ': '🌡️',
    'Diğer': '🛠️'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hizmetlerimiz
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Bodrum ve Milas bölgesinde, 20 yıllık deneyimimiz ile mekanik tesisat, 
            enerji sistemleri ve su arıtma konularında profesyonel çözümler sunuyoruz.
          </p>
        </div>

        {Object.entries(groupedServices).map(([kategori, services]: [string, Hizmet[]]) => (
          <div key={kategori} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{categoryIcons[kategori] || '🛠️'}</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {kategori}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((hizmet) => (
                <div
                  key={hizmet.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {hizmet.resim_url && (
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <Image
                        src={hizmet.resim_url}
                        alt={hizmet.hizmet_adi}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {hizmet.hizmet_adi}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {hizmet.aciklama}
                    </p>
                    
                    {hizmet.marka_text && hizmet.marka_text.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Çalıştığımız Markalar:</p>
                        <div className="flex flex-wrap gap-2">
                          {hizmet.marka_text.slice(0, 3).map((marka: string, index: number) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md"
                            >
                              {marka}
                            </span>
                          ))}
                          {hizmet.marka_text.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                              +{hizmet.marka_text.length - 3} daha
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {hizmet.seo_slug && (
                      <a
                        href={`/hizmetler/${hizmet.seo_slug}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium group/link"
                      >
                        Detaylı Bilgi
                        <svg
                          className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {hizmetler.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Henüz hizmet bilgisi bulunmamaktadır.
            </p>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Neden Gül-Tekin Mühendislik?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="text-4xl mb-3">✨</div>
                <h3 className="font-semibold text-lg mb-2">20+ Yıl Deneyim</h3>
                <p className="text-blue-100 text-sm">
                  Sektörde 20 yılı aşkın deneyim ve 500+ başarılı proje
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🛡️</div>
                <h3 className="font-semibold text-lg mb-2">Garanti & Servis</h3>
                <p className="text-blue-100 text-sm">
                  Tüm işlerimizde garanti ve 7/24 teknik destek hizmeti
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🌿</div>
                <h3 className="font-semibold text-lg mb-2">Enerji Verimliliği</h3>
                <p className="text-blue-100 text-sm">
                  Çevre dostu ve enerji tasarruflu çözümler
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Hemen Teklif Alın
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Toplam {hizmetler.length} hizmet kategorisinde uzman çözümler sunuyoruz
          </p>
        </div>
      </div>
    </div>
  );
}