import { getUrunlerFromNeon } from '@/lib/airtable-urunler-client';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 3600;

export default async function UrunlerPage() {
  const urunler = await getUrunlerFromNeon();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ürünler</h1>
          <p className="text-lg text-gray-600">Kaliteli ürünlerimizi keşfedin</p>
        </div>

        {urunler.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz ürün bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {urunler.map((urun) => (
              <div
                key={urun.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {(urun.gorsel_url || urun.cloudinary_url) && (
                  <div className="relative h-64 w-full">
                    <Image
                      src={urun.cloudinary_url || urun.gorsel_url}
                      alt={urun.urun_adi || 'Ürün'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {urun.urun_adi}
                  </h2>
                  
                  {urun.kategori && (
                    <span className="inline-block px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-full mb-3">
                      {urun.kategori}
                    </span>
                  )}
                  
                  {urun.aciklama && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {urun.aciklama}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    {urun.fiyat && (
                      <div className="text-2xl font-bold text-green-600">
                        ₺{urun.fiyat.toLocaleString('tr-TR')}
                      </div>
                    )}
                    
                    {urun.slug && (
                      <Link
                        href={`/urunler/${urun.slug}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Detayları Gör
                      </Link>
                    )}
                  </div>
                  
                  {urun.marka && (
                    <div className="mt-4 text-sm text-gray-500">
                      Marka: {urun.marka}
                    </div>
                  )}
                  
                  {urun.stokta !== undefined && (
                    <div className="mt-2">
                      <span className={`text-sm ${urun.stokta ? 'text-green-600' : 'text-red-600'}`}>
                        {urun.stokta ? '✓ Stokta' : '✗ Stok Dışı'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}