import { sql } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { decodeAndNormalizeSlug } from '@/lib/utils/slug';

// export const revalidate = 3600;

interface UrunDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Product {
  id: number;
  urun_adi: string;
  slug: string;
  aciklama?: string;
  fiyat?: number;
  kategori?: string;
  marka?: string;
  sku?: string;
  stokta?: boolean;
  etiketler?: string[];
  gorsel_url?: string;
  cloudinary_url?: string;
  cloudinary_public_id?: string;
  aktif?: boolean;
  siralama_no?: number;
  ozellikler?: Record<string, unknown> | string;
  agirlik?: number;
  boyutlar?: string;
  synced_at?: string;
  updated_at?: string;
}

async function getUrunBySlug(slug: string): Promise<Product | null> {
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
  
  return result[0] as Product || null;
}

async function getRelatedProducts(kategori: string, currentSlug: string): Promise<Product[]> {
  const result = await sql`
    SELECT 
      id,
      urun_adi,
      slug,
      aciklama,
      fiyat,
      kategori,
      marka,
      gorsel_url,
      cloudinary_url,
      stokta
    FROM urunler
    WHERE kategori = ${kategori} 
      AND slug != ${currentSlug}
      AND aktif = true
      AND slug IS NOT NULL
    ORDER BY RANDOM()
    LIMIT 4
  `;
  
  return result as Product[];
}

// Comment out static generation - use dynamic rendering instead
// export async function generateStaticParams() {
//   try {
//     const result = await sql`
//       SELECT slug
//       FROM urunler
//       WHERE aktif = true
//         AND slug IS NOT NULL
//         AND slug != ''
//       LIMIT 100
//     `;
//
//     return result.map((urun) => ({
//       slug: urun.slug,
//     }));
//   } catch (error) {
//     console.error('Error generating static params for urunler:', error);
//     return [];
//   }
// }

// Force dynamic rendering for better performance and fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: UrunDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeAndNormalizeSlug(slug);
  const urun = await getUrunBySlug(decodedSlug);
  
  if (!urun) {
    return {
      title: 'Ürün Bulunamadı',
      description: 'Aradığınız ürün bulunamadı.'
    };
  }
  
  return {
    title: `${urun.urun_adi} - ${urun.marka || 'Gül-Tekin Mühendislik'}`,
    description: urun.aciklama || `${urun.urun_adi} detayları ve fiyat bilgisi. ${urun.kategori} kategorisinde ${urun.marka || ''} markasının kaliteli ürünü.`,
    alternates: {
      canonical: `https://gul-tekinmuhendislik.com/urunler/${slug}`,
    },
    openGraph: {
      title: urun.urun_adi,
      description: urun.aciklama || `${urun.urun_adi} detayları`,
      images: urun.cloudinary_url || urun.gorsel_url ? [urun.cloudinary_url || urun.gorsel_url] : [],
      url: `https://gul-tekinmuhendislik.com/urunler/${slug}`,
    }
  };
}

export default async function UrunDetailPage({ params }: UrunDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeAndNormalizeSlug(slug);
  const urun = await getUrunBySlug(decodedSlug);
  
  if (!urun) {
    notFound();
  }
  
  const relatedProducts = urun.kategori ? await getRelatedProducts(urun.kategori, decodedSlug) : [];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Ana Sayfa
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/urunler" className="text-gray-500 hover:text-gray-700">
            Ürünler
          </Link>
          {urun.kategori && (
            <>
              <span className="text-gray-400">/</span>
              <Link 
                href={`/urunler?kategori=${encodeURIComponent(urun.kategori)}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {urun.kategori}
              </Link>
            </>
          )}
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{urun.urun_adi}</span>
        </nav>
        
        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative bg-gray-50 aspect-square lg:aspect-auto">
              {(urun.cloudinary_url || urun.gorsel_url) ? (
                <Image
                  src={urun.cloudinary_url || urun.gorsel_url || ''}
                  alt={urun.urun_adi || 'Ürün'}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Info Section */}
            <div className="p-8 lg:p-12">
              {/* Brand */}
              {urun.marka && (
                <Link 
                  href={`/urunler?marka=${encodeURIComponent(urun.marka)}`}
                  className="inline-block text-blue-600 hover:text-blue-700 font-medium mb-2"
                >
                  {urun.marka}
                </Link>
              )}
              
              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {urun.urun_adi}
              </h1>
              
              {/* SKU */}
              {urun.sku && (
                <p className="text-sm text-gray-500 mb-4">SKU: {urun.sku}</p>
              )}
              
              {/* Price */}
              {urun.fiyat && urun.fiyat > 0 && (
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    ₺{urun.fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">KDV Dahil</span>
                </div>
              )}
              
              {/* Stock Status */}
              {urun.stokta !== undefined && (
                <div className="mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                    urun.stokta 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {urun.stokta ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Stokta Mevcut
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Stok Dışı
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Description */}
              {urun.aciklama && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Ürün Açıklaması</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{urun.aciklama}</p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <Link 
                  href="/contact"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Teklif Al
                </Link>
                <Link
                  href={`https://wa.me/905323177859?text=${encodeURIComponent(`Merhaba, ${urun.urun_adi} hakkında bilgi almak istiyorum.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  WhatsApp
                </Link>
              </div>
              
              {/* Tags */}
              {urun.etiketler && Array.isArray(urun.etiketler) && urun.etiketler.length > 0 && (
                <div className="pt-6 border-t">
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
        
        {/* Product Features */}
        {(urun.ozellikler || urun.agirlik || urun.boyutlar) && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Teknik Özellikler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {urun.kategori && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Kategori</span>
                  <span className="font-medium text-gray-900">{urun.kategori}</span>
                </div>
              )}
              {urun.marka && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Marka</span>
                  <span className="font-medium text-gray-900">{urun.marka}</span>
                </div>
              )}
              {urun.agirlik && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Ağırlık</span>
                  <span className="font-medium text-gray-900">{urun.agirlik} ton</span>
                </div>
              )}
              {urun.boyutlar && (
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Boyutlar</span>
                  <span className="font-medium text-gray-900">{urun.boyutlar}</span>
                </div>
              )}
            </div>
            {urun.ozellikler && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Detaylı Özellikler</h3>
                <div className="text-gray-600 whitespace-pre-wrap">
                  {typeof urun.ozellikler === 'object' ? JSON.stringify(urun.ozellikler, null, 2) : urun.ozellikler}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">İlgili Ürünler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/urunler/${product.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-50">
                    {(product.cloudinary_url || product.gorsel_url) ? (
                      <Image
                        src={product.cloudinary_url || product.gorsel_url || ''}
                        alt={product.urun_adi}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {product.marka && (
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        {product.marka}
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.urun_adi}
                    </h3>
                    {product.fiyat && product.fiyat > 0 && (
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        ₺{product.fiyat.toLocaleString('tr-TR')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}