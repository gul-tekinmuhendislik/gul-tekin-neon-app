import { NextResponse } from 'next/server';
import { getAllProjeler } from '@/lib/airtable-projeler-client';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const batch = parseInt(url.searchParams.get('batch') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    const clear = url.searchParams.get('clear') === 'true';
    
    console.log(`Batch sync - Batch: ${batch}, Size: ${size}, Clear: ${clear}`);
    
    // İlk batch'te tabloyu temizle
    if (batch === 0 && clear) {
      await sql`TRUNCATE TABLE projeler CASCADE`;
      console.log('Cleared existing projeler data');
    }
    
    // Get all records from Airtable
    const allRecords = await getAllProjeler();
    console.log(`Total records available: ${allRecords.length}`);
    
    // Calculate batch boundaries
    const startIndex = batch * size;
    const endIndex = startIndex + size;
    const records = allRecords.slice(startIndex, endIndex);
    
    console.log(`Processing batch ${batch}: records ${startIndex}-${endIndex-1} (${records.length} records)`);
    
    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No more records to process',
        batch,
        processed: 0,
        total: allRecords.length,
        hasMore: false,
        nextBatch: null,
      });
    }
    
    // Process current batch
    let processed = 0;
    const processedData = [];
    
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
      
      const projectData = {
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
      };
      
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
            ${projectData.airtable_id},
            ${projectData.isim},
            ${projectData.slug},
            ${projectData.aciklama},
            ${projectData.musteri},
            ${projectData.konum},
            ${projectData.tarih},
            ${projectData.resim_url},
            ${projectData.kategori},
            ${projectData.hizmetler},
            ${projectData.markalar},
            ${projectData.durum},
            ${projectData.onemli},
            ${projectData.galeri},
            ${projectData.etiketler},
            ${projectData.aktif},
            ${projectData.sira},
            NOW(),
            NOW()
          )
          ON CONFLICT (airtable_id) DO UPDATE SET
            isim = EXCLUDED.isim,
            slug = EXCLUDED.slug,
            aciklama = EXCLUDED.aciklama,
            musteri = EXCLUDED.musteri,
            konum = EXCLUDED.konum,
            tarih = EXCLUDED.tarih,
            resim_url = EXCLUDED.resim_url,
            kategori = EXCLUDED.kategori,
            hizmetler = EXCLUDED.hizmetler,
            markalar = EXCLUDED.markalar,
            durum = EXCLUDED.durum,
            onemli = EXCLUDED.onemli,
            galeri = EXCLUDED.galeri,
            etiketler = EXCLUDED.etiketler,
            aktif = EXCLUDED.aktif,
            sira = EXCLUDED.sira,
            guncelleme_tarihi = NOW()
        `;
        
        processedData.push({
          id: record.id,
          name: projectData.isim,
          slug: projectData.slug,
          hasImage: !!mainImage,
        });
        
        processed++;
      } catch (error) {
        console.error(`Error processing record ${record.id}:`, error);
      }
    }
    
    const hasMore = endIndex < allRecords.length;
    const nextBatch = hasMore ? batch + 1 : null;
    
    console.log(`Batch ${batch} completed: ${processed}/${records.length} processed`);
    
    return NextResponse.json({
      success: true,
      message: `Batch ${batch} processed successfully`,
      batch,
      processed,
      total: allRecords.length,
      hasMore,
      nextBatch,
      processedData: processedData.slice(0, 5), // Show first 5 as sample
      progress: {
        completed: endIndex > allRecords.length ? allRecords.length : endIndex,
        total: allRecords.length,
        percentage: Math.round(((endIndex > allRecords.length ? allRecords.length : endIndex) / allRecords.length) * 100)
      }
    });
  } catch (error) {
    console.error('Error in batch sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        batch: parseInt(new URL(request.url).searchParams.get('batch') || '0'),
      },
      { status: 500 }
    );
  }
}