import { NextResponse } from 'next/server';
import { getAllProjeler } from '@/lib/airtable-projeler-client';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('Starting fast projeler sync...');
    
    // Get all records from Airtable
    const records = await getAllProjeler();
    console.log(`Found ${records.length} records from Airtable`);
    
    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No records to sync',
        count: 0,
      });
    }
    
    // Clear existing data
    await sql`TRUNCATE TABLE projeler CASCADE`;
    console.log('Cleared existing projeler data');
    
    // Prepare batch insert data
    const insertData = [];
    
    for (const record of records) {
      if (!record.id) continue;
      
      const { fields } = record;
      
      // Process images
      const mainImage = fields['Resimler']?.[0]?.url || null;
      const galleryImages = fields['Resimler']?.map(img => img.url) || [];
      
      // Generate unique slug
      let slug = fields['SEO:slug'] || fields['Proje Adı']?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
      if (!slug && record.id) {
        slug = record.id.substring(0, 8);
      }
      
      insertData.push({
        airtable_id: record.id,
        isim: fields['Proje Adı'] || '',
        slug: slug,
        aciklama: fields['Açıklama'] || '',
        musteri: fields['Mahalle Adı'] || '',
        konum: fields['İlçe Adı'] || '',
        tarih: fields['Proje Başlangıç Tarihi'] || null,
        resim_url: mainImage,
        kategori: fields['Ana faaliyet Konusu']?.[0] || '',
        hizmetler: fields['Ana faaliyet Konusu'] || [],
        markalar: [],
        durum: 'Tamamlandı',
        onemli: false,
        galeri: galleryImages,
        etiketler: [fields['Proje Yılı']].filter(Boolean),
        aktif: true,
        sira: 0,
      });
    }
    
    console.log(`Prepared ${insertData.length} records for batch insert`);
    
    // Insert one by one for simplicity and debugging
    let totalInserted = 0;
    
    for (const item of insertData) {
      try {
        await sql`
          INSERT INTO projeler (
            airtable_id,
            isim,
            slug,
            aciklama,
            musteri,
            konum,
            tarih,
            resim_url,
            kategori,
            hizmetler,
            markalar,
            durum,
            onemli,
            galeri,
            etiketler,
            aktif,
            sira,
            olusturma_tarihi,
            guncelleme_tarihi
          ) VALUES (
            ${item.airtable_id},
            ${item.isim},
            ${item.slug},
            ${item.aciklama},
            ${item.musteri},
            ${item.konum},
            ${item.tarih},
            ${item.resim_url},
            ${item.kategori},
            ${item.hizmetler},
            ${item.markalar},
            ${item.durum},
            ${item.onemli},
            ${item.galeri},
            ${item.etiketler},
            ${item.aktif},
            ${item.sira},
            NOW(),
            NOW()
          )
        `;
        totalInserted++;
        
        if (totalInserted % 50 === 0) {
          console.log(`Inserted ${totalInserted}/${insertData.length} records`);
        }
      } catch (error) {
        console.error(`Error inserting record ${item.airtable_id}:`, error);
      }
    }
    
    console.log(`Fast sync completed: ${totalInserted} records inserted`);
    
    return NextResponse.json({
      success: true,
      message: 'Fast projeler sync completed',
      count: totalInserted,
      total: records.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in fast sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}