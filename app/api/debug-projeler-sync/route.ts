import { NextResponse } from 'next/server';
import { getAllProjeler } from '@/lib/airtable-projeler-client';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('Debug: Starting projeler sync debug...');
    
    // Get first 5 records from Airtable
    const records = await getAllProjeler();
    const firstFive = records.slice(0, 5);
    
    console.log(`Debug: Found ${records.length} total records`);
    
    const processedRecords = [];
    
    for (const record of firstFive) {
      if (!record.id) continue;
      
      const { fields } = record;
      console.log(`Debug: Processing record ${record.id}:`, JSON.stringify(fields, null, 2));
      
      // Process images
      const mainImage = fields['Resimler']?.[0]?.url || null;
      const galleryImages = fields['Resimler']?.map(img => img.url) || [];
      
      // Generate unique slug
      const slug = fields['SEO:slug'] || fields['Proje Adı']?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
      
      console.log(`Debug: Generated slug: ${slug}`);
      console.log(`Debug: Main image: ${mainImage}`);
      console.log(`Debug: Gallery images count: ${galleryImages.length}`);
      
      // Check if record exists
      const existing = await sql`
        SELECT id FROM projeler WHERE airtable_id = ${record.id}
      `;
      
      console.log(`Debug: Existing record check: ${existing.length > 0 ? 'EXISTS' : 'NEW'}`);
      
      const processedRecord = {
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
        exists: existing.length > 0
      };
      
      processedRecords.push(processedRecord);
    }
    
    return NextResponse.json({
      success: true,
      totalRecords: records.length,
      processedSample: processedRecords,
      message: 'Debug completed - check server logs for details'
    });
  } catch (error) {
    console.error('Debug error:', error);
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