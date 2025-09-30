import { getMarkalariNeon } from '@/lib/markalar-client';
import Image from 'next/image';

// Force dynamic rendering since brand data can change
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MarkalarPage() {
  const markalar = await getMarkalariNeon();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Çalıştığımız Markalar
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Güvenilir ve kaliteli markalarla çalışarak, müşterilerimize en iyi hizmet ve ürünleri sunuyoruz.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {markalar.map((marka) => (
            <div
              key={marka.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col items-center justify-center group"
            >
              {(marka.cloudinary_url || marka.logo_url) ? (
                <div className="w-full h-32 mb-4 flex items-center justify-center">
                  <Image
                    src={marka.cloudinary_url || marka.logo_url || ''}
                    alt={`${marka.marka_adi} logo`}
                    width={150}
                    height={150}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-full h-32 mb-4 flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-3xl font-bold text-gray-400">
                    {marka.marka_adi?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {marka.marka_adi}
              </h3>
              
              {marka.aciklama && (
                <p className="text-sm text-gray-600 text-center line-clamp-3">
                  {marka.aciklama}
                </p>
              )}
              
              {marka.yetkili_servis && (
                <span className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Yetkili Servis
                </span>
              )}
            </div>
          ))}
        </div>

        {markalar.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Henüz marka bilgisi bulunmamaktadır.
            </p>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Toplam {markalar.length} marka listeleniyor
          </p>
        </div>
      </div>
    </div>
  );
}