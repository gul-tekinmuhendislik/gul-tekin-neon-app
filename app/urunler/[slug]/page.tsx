import { sql } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface UrunDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getUrunBySlug(slug: string) {
  const result = await sql`
    SELECT 
      id,
      urun_adi,
      slug,
      aciklama,
      fiyat,
      kategori,
      marka,
      sku,
      stokta,
      etiketler,
      gorsel_url,
      cloudinary_url,
      cloudinary_public_id,
      aktif,
      siralama_no,
      ozellikler,
      agirlik,
      boyutlar,
      synced_at,
      updated_at
    FROM urunler
    WHERE slug = ${slug} AND aktif = true
    LIMIT 1
  `;
  
  return result[0];
}

export async function generateStaticParams() {
  try {
    const result = await sql`
      SELECT slug 
      FROM urunler 
      WHERE aktif = true 
        AND slug IS NOT NULL 
        AND slug != ''
      LIMIT 100
    `;
    
    return result.map((urun) => ({
      slug: urun.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for urunler:', error);
    return [];
  }
}

export async function generateMetadata({ params }: UrunDetailPageProps) {
  const { slug } = await params;
  const urun = await getUrunBySlug(slug);
  
  if (!urun) {
    return {
      title: 'Ürün Bulunamadı',
      description: 'Aradığınız ürün bulunamadı.'
    };
  }
  
  return {
    title: urun.urun_adi || 'Ürün Detayı',
    description: urun.aciklama || `${urun.urun_adi} detayları ve fiyat bilgisi`,
  };
}

export default async function UrunDetailPage({ params }: UrunDetailPageProps) {
  const { slug } = await params;
  const urun = await getUrunBySlug(slug);
  
  if (!urun) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          href="/urunler"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tüm Ürünler
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {(urun.gorsel_url || urun.cloudinary_url) && (
              <div className="relative h-96 lg:h-full">
                <Image
                  src={urun.cloudinary_url || urun.gorsel_url}
                  alt={urun.urun_adi || 'Ürün'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            )}
            
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {urun.urun_adi}
              </h1>
              
              {urun.kategori && (
                <span className="inline-block px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4">
                  {urun.kategori}
                </span>
              )}
              
              {urun.aciklama && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Açıklama</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">{urun.aciklama}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {urun.marka && (
                  <div>
                    <span className="text-sm text-gray-500">Marka</span>
                    <p className="font-medium text-gray-900">{urun.marka}</p>
                  </div>
                )}
                
                {urun.sku && (
                  <div>
                    <span className="text-sm text-gray-500">SKU</span>
                    <p className="font-medium text-gray-900">{urun.sku}</p>
                  </div>
                )}
                
                {urun.agirlik && (
                  <div>
                    <span className="text-sm text-gray-500">Ağırlık</span>
                    <p className="font-medium text-gray-900">{urun.agirlik} ton</p>
                  </div>
                )}
                
                {urun.boyutlar && (
                  <div>
                    <span className="text-sm text-gray-500">Depo Tipi</span>
                    <p className="font-medium text-gray-900">{urun.boyutlar}</p>
                  </div>
                )}
              </div>
              
              {urun.ozellikler && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Özellikler</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">{urun.ozellikler}</p>
                </div>
              )}
              
              {urun.stokta !== undefined && (
                <div className="mb-6">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    urun.stokta 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {urun.stokta ? '✓ Stokta Mevcut' : '✗ Stok Dışı'}
                  </span>
                </div>
              )}
              
              <div className="flex gap-4">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Sipariş Ver
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  İletişime Geç
                </button>
              </div>
              
              {urun.etiketler && urun.etiketler.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {urun.etiketler.map((etiket: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        #{etiket}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}