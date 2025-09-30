import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface Urun {
  id: string;
  urun_adi: string;
  slug?: string;
  aciklama?: string;
  fiyat?: number;
  kategori?: string;
  marka?: string;
}

interface Hizmet {
  id: string;
  hizmet_adi: string;
  aciklama?: string;
  slug?: string;
  resim_url?: string;
  cloudinary_url?: string;
  urunler?: Urun[]; // Ürünler dizisi eklendi
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const { slug } = resolvedParams;

    // Lokasyon bilgilerini al
    const [lokasyon] = await sql`
      SELECT
        id,
        ilce_adi,
        slug,
        il,
        aciklama,
        resim_url,
        aktif,
        sira,
        created_at,
        updated_at
      FROM hizmet_lokasyonlari
      WHERE slug = ${slug} AND aktif = true
    `;

    if (!lokasyon) {
      return NextResponse.json(
        { error: 'Lokasyon bulunamadı' },
        { status: 404 }
      );
    }

    // Bu lokasyonda sunulan hizmetleri al
    const hizmetlerResult = await sql`
      SELECT
        h.id,
        h.hizmet_adi,
        h.aciklama,
        h.slug,
        h.resim_url,
        h.cloudinary_url,
        h.urunler
      FROM hizmetler h
      WHERE h.aktif = true
      ORDER BY h.seo_index ASC, h.hizmet_adi ASC
    `;

    const hizmetler: Hizmet[] = hizmetlerResult as Hizmet[];

    // Her hizmet için ürün bilgilerini al
    const hizmetlerVeUrunler = await Promise.all(
      hizmetler.map(async (hizmet) => {
        if (hizmet.urunler && hizmet.urunler.length > 0) {
          try {
            // Hizmete bağlı ürünleri al
            const urunler = await sql`
              SELECT 
                id, 
                urun_adi, 
                fiyat, 
                kategori, 
                marka,
                cloudinary_url
              FROM urunler 
              WHERE id = ANY(${hizmet.urunler}::text[]) 
              AND aktif = true
              LIMIT 5
            `;
            return { ...hizmet, urunler };
          } catch (error) {
            console.error(`Hizmet ID ${hizmet.id} için ürünler yüklenirken hata:`, error);
            return { ...hizmet, urunler: [] };
          }
        }
        return { ...hizmet, urunler: [] };
      })
    );

    // Bu lokasyondaki mahalleleri al
    const mahalleler = await sql`
      SELECT
        id,
        mahalle_adi,
        slug,
        aciklama,
        proje_sayisi
      FROM mahalleler
      WHERE ilce_id = ${lokasyon.id}
      ORDER BY mahalle_adi ASC
    `;

    return NextResponse.json({
      lokasyon,
      hizmetler: hizmetlerVeUrunler,
      mahalleler
    });
  } catch (error) {
    console.error('Lokasyon detayı alınırken hata:', error);
    return NextResponse.json(
      { error: 'Lokasyon detayı alınamadı' },
      { status: 500 }
    );
  }
}