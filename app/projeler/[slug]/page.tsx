import { sql } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { generateProjectAltText } from '@/lib/seo-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProjeDetay {
  id: number;
  airtable_id: string;
  proje_adi: string;
  slug: string;
  aciklama: string;
  mahalle: string;
  ilce: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  proje_yili: string;
  ana_faaliyet_konusu: string[];
  airtable_resim_url: string;
  airtable_galeri_urls: string[];
  cloudinary_url: string;
  cloudinary_public_id: string;
  cloudinary_galeri_urls: string[];
  cloudinary_galeri_public_ids: string[];
  aktif: boolean;
  sira: number;
}

async function getProjeBySlug(slug: string): Promise<ProjeDetay | null> {
  try {
    const result = await sql`
      SELECT 
        id,
        airtable_id,
        proje_adi,
        slug,
        aciklama,
        mahalle,
        ilce,
        baslangic_tarihi,
        bitis_tarihi,
        proje_yili,
        ana_faaliyet_konusu,
        airtable_resim_url,
        airtable_galeri_urls,
        cloudinary_url,
        cloudinary_public_id,
        cloudinary_galeri_urls,
        cloudinary_galeri_public_ids,
        aktif,
        sira
      FROM projeler_gul_tekin
      WHERE slug = ${slug} AND aktif = true
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0] as ProjeDetay;
  } catch (error) {
    console.error('Error fetching proje:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const proje = await getProjeBySlug(slug);
  
  if (!proje) {
    return {
      title: 'Proje Bulunamadı',
      description: 'Aradığınız proje bulunamadı.'
    };
  }
  
  return {
    title: `${proje.proje_adi} - Gül-Tekin Mühendislik`,
    description: proje.aciklama ? proje.aciklama.substring(0, 160).replace(/\*\*/g, '') : `${proje.proje_adi} projesi detayları. ${proje.mahalle}, ${proje.ilce}`,
    alternates: {
      canonical: `https://gul-tekinmuhendislik.com/projeler/${slug}`,
      languages: {
        'tr-TR': `https://gul-tekinmuhendislik.com/projeler/${slug}`,
        'x-default': `https://gul-tekinmuhendislik.com/projeler/${slug}`,
      },
    },
    openGraph: {
      title: proje.proje_adi,
      description: proje.aciklama ? proje.aciklama.substring(0, 160).replace(/\*\*/g, '') : `${proje.proje_adi} projesi detayları`,
      images: proje.cloudinary_url || proje.airtable_resim_url ? [proje.cloudinary_url || proje.airtable_resim_url] : [],
      url: `https://gul-tekinmuhendislik.com/projeler/${slug}`,
      type: 'website',
    }
  };
}

export default async function ProjeDetayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const proje = await getProjeBySlug(slug);
  
  if (!proje) {
    notFound();
  }
  
  const mainImageUrl = proje.cloudinary_url || proje.airtable_resim_url;
  const galleryImages = proje.cloudinary_galeri_urls?.length > 0 
    ? proje.cloudinary_galeri_urls 
    : proje.airtable_galeri_urls || [];
  
  // Format açıklama - Markdown'ı basit HTML'e çevir
  const formatDescription = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');
  };
  
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Ana Sayfa', url: '/' },
          { name: 'Projeler', url: '/projeler' },
          { name: proje.proje_adi, url: `/projeler/${slug}` }
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Ana Sayfa
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/projeler" className="text-gray-500 hover:text-gray-700">
              Projeler
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">{proje.proje_adi}</li>
        </ol>
      </nav>
      
      {/* Proje Başlığı */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{proje.proje_adi}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {proje.mahalle && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {proje.mahalle}, {proje.ilce}
            </div>
          )}
          {proje.baslangic_tarihi && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(proje.baslangic_tarihi).toLocaleDateString('tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          )}
          {proje.proje_yili && (
            <div className="flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {proje.proje_yili}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon - Görseller */}
        <div className="lg:col-span-2">
          {/* Ana Görsel */}
          {mainImageUrl && (
            <div className="mb-6">
              <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={mainImageUrl}
                  alt={generateProjectAltText(proje.proje_adi, `${proje.mahalle} ${proje.ilce}`)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
            </div>
          )}
          
          {/* Galeri */}
          {galleryImages.length > 1 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Proje Görselleri</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.slice(1).map((imageUrl, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={generateProjectAltText(proje.proje_adi, `${proje.mahalle} ${proje.ilce}`, index + 1)}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Açıklama */}
          {proje.aciklama && (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-xl font-semibold mb-4">Proje Hakkında</h2>
              <div 
                className="text-gray-700 space-y-4"
                dangerouslySetInnerHTML={{ 
                  __html: `<p>${formatDescription(proje.aciklama)}</p>` 
                }}
              />
            </div>
          )}
        </div>
        
        {/* Sağ Kolon - Proje Detayları */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Proje Detayları</h3>
            
            <div className="space-y-3">
              {proje.mahalle && (
                <div>
                  <span className="text-sm text-gray-500">Mahalle</span>
                  <p className="font-medium">{proje.mahalle}</p>
                </div>
              )}
              
              {proje.ilce && (
                <div>
                  <span className="text-sm text-gray-500">İlçe</span>
                  <p className="font-medium">{proje.ilce}</p>
                </div>
              )}
              
              {proje.proje_yili && (
                <div>
                  <span className="text-sm text-gray-500">Proje Yılı</span>
                  <p className="font-medium">{proje.proje_yili}</p>
                </div>
              )}
              
              {proje.baslangic_tarihi && (
                <div>
                  <span className="text-sm text-gray-500">Başlangıç Tarihi</span>
                  <p className="font-medium">
                    {new Date(proje.baslangic_tarihi).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
              
              {proje.bitis_tarihi && proje.bitis_tarihi !== proje.baslangic_tarihi && (
                <div>
                  <span className="text-sm text-gray-500">Bitiş Tarihi</span>
                  <p className="font-medium">
                    {new Date(proje.bitis_tarihi).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
              
              {proje.ana_faaliyet_konusu && proje.ana_faaliyet_konusu.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">Faaliyet Alanları</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {proje.ana_faaliyet_konusu.map((faaliyet, index) => (
                      <span
                        key={index}
                        className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                      >
                        {faaliyet}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* İletişim Butonu */}
            <div className="mt-6 pt-6 border-t">
              <Link
                href="/iletisim"
                className="w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors block"
              >
                Bu Proje Hakkında Bilgi Al
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alt Navigasyon */}
      <div className="mt-12 pt-8 border-t">
        <Link
          href="/projeler"
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Tüm Projelere Dön
        </Link>
      </div>
    </div>
    </>
  );
}