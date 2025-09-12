import { sql } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';

interface Proje {
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

async function getProjeler(page: number = 1, perPage: number = 12) {
  try {
    const offset = (page - 1) * perPage;
    
    // Get total count for pagination
    const countResult = await sql`
      SELECT COUNT(*) as count
      FROM projeler_gul_tekin
      WHERE aktif = true
    `;
    const totalCount = Number(countResult[0]?.count || 0);
    
    // Get paginated projeler
    const projeler = await sql`
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
      WHERE aktif = true
      ORDER BY sira ASC, baslangic_tarihi DESC, id DESC
      LIMIT ${perPage}
      OFFSET ${offset}
    `;
    
    return {
      projeler: projeler as Proje[],
      totalCount,
      totalPages: Math.ceil(totalCount / perPage),
      currentPage: page,
      perPage
    };
  } catch (error) {
    console.error('Error fetching projeler:', error);
    return {
      projeler: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      perPage
    };
  }
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ProjelerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const { projeler, totalCount, totalPages } = await getProjeler(currentPage);

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
          const imageUrl = proje.cloudinary_url || proje.airtable_resim_url;
          
          return (
            <Link
              key={proje.id}
              href={`/projeler/${proje.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
            >
              {imageUrl && (
                <div className="relative h-48 w-full bg-gray-200">
                  <Image
                    src={imageUrl}
                    alt={proje.proje_adi}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {proje.proje_yili && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                      {proje.proje_yili}
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{proje.proje_adi}</h3>
                
                {proje.mahalle && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Mahalle:</span> {proje.mahalle}
                  </p>
                )}
                
                {proje.ilce && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">İlçe:</span> {proje.ilce}
                  </p>
                )}
                
                {proje.baslangic_tarihi && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Tarih:</span> {new Date(proje.baslangic_tarihi).toLocaleDateString('tr-TR')}
                  </p>
                )}
                
                {proje.aciklama && (
                  <p className="text-gray-700 mt-3 line-clamp-3">
                    {proje.aciklama.replace(/\*\*/g, '').replace(/\n/g, ' ').substring(0, 150)}...
                  </p>
                )}
                
                {proje.ana_faaliyet_konusu && proje.ana_faaliyet_konusu.length > 0 && (
                  <div className="mt-3">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {proje.ana_faaliyet_konusu.length} Faaliyet
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {projeler.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Henüz proje bulunmamaktadır.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          {currentPage > 1 && (
            <Link
              href={`/projeler?page=${currentPage - 1}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Önceki
            </Link>
          )}
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <Link
                    key={page}
                    href={`/projeler?page=${page}`}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </Link>
                );
              }
              
              // Show ellipsis for gaps
              if (page === currentPage - 3 || page === currentPage + 3) {
                return (
                  <span key={page} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              
              return null;
            })}
          </div>
          
          {currentPage < totalPages && (
            <Link
              href={`/projeler?page=${currentPage + 1}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Sonraki
            </Link>
          )}
        </div>
      )}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Toplam {totalCount} projeden {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalCount)} arası gösteriliyor
      </div>
    </div>
  );
}