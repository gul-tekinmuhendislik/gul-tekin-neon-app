import { sql } from '@/lib/db';
import Image from 'next/image';

interface Proje {
  id: number;
  isim: string;
  slug: string;
  aciklama: string;
  musteri: string;
  konum: string;
  tarih: string;
  resim_url: string;
  cloudinary_url: string;
  cloudinary_resim_url: string;
  kategori: string;
  hizmetler: string[];
  markalar: string[];
  durum: string;
  onemli: boolean;
  aktif: boolean;
}

async function getProjeler() {
  try {
    const projeler = await sql`
      SELECT 
        id,
        isim,
        slug,
        aciklama,
        musteri,
        konum,
        tarih,
        resim_url,
        cloudinary_url,
        cloudinary_resim_url,
        kategori,
        hizmetler,
        markalar,
        durum,
        onemli,
        aktif
      FROM projeler_2026
      WHERE aktif = true
      ORDER BY onemli DESC, tarih DESC, id DESC
      LIMIT 100
    `;
    
    return projeler as Proje[];
  } catch (error) {
    console.error('Error fetching projeler:', error);
    return [];
  }
}

export default async function ProjelerPage() {
  const projeler = await getProjeler();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Projeler</h1>
        <p className="text-gray-600">
          Tamamladığımız ve devam eden projelerimiz
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projeler.map((proje) => {
          const imageUrl = proje.cloudinary_url || proje.cloudinary_resim_url || proje.resim_url;
          
          return (
            <div
              key={proje.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {imageUrl && (
                <div className="relative h-48 w-full bg-gray-200">
                  <Image
                    src={imageUrl}
                    alt={proje.isim}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {proje.onemli && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      Önemli
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{proje.isim}</h3>
                
                {proje.musteri && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Müşteri:</span> {proje.musteri}
                  </p>
                )}
                
                {proje.konum && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Konum:</span> {proje.konum}
                  </p>
                )}
                
                {proje.tarih && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Tarih:</span> {new Date(proje.tarih).toLocaleDateString('tr-TR')}
                  </p>
                )}
                
                {proje.aciklama && (
                  <p className="text-gray-700 mt-3 line-clamp-3">
                    {proje.aciklama}
                  </p>
                )}
                
                {proje.kategori && (
                  <div className="mt-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {proje.kategori}
                    </span>
                  </div>
                )}
                
                {proje.hizmetler && proje.hizmetler.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {proje.hizmetler.slice(0, 3).map((hizmet, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {hizmet}
                      </span>
                    ))}
                    {proje.hizmetler.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{proje.hizmetler.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {projeler.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Henüz proje bulunmamaktadır.</p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        Toplam {projeler.length} proje gösteriliyor
      </div>
    </div>
  );
}