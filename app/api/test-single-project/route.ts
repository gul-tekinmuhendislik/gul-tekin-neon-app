import { NextResponse } from 'next/server';
import { getAllProjeler } from '@/lib/airtable-projeler-client';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing single project insert...');
    
    // Get first record from Airtable
    const records = await getAllProjeler();
    console.log(`Found ${records.length} total records`);
    
    if (records.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No records found in Airtable'
      });
    }
    
    const record = records[0];
    console.log('First record:', JSON.stringify(record, null, 2));
    
    if (!record.id || !record.fields) {
      return NextResponse.json({
        success: false,
        error: 'Invalid record structure'
      });
    }
    
    const fields = record.fields;
    
    // Process the record
    const mainImage = fields['Resimler']?.[0]?.url || null;
    const galleryImages = fields['Resimler']?.map(img => img.url) || [];
    const slug = fields['SEO:slug'] || fields['Proje Adı']?.toLowerCase()?.replace(/\s+/g, '-')?.replace(/[^a-z0-9-]/g, '') || record.id.substring(0, 8);
    
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
      sira: 0
    };
    
    console.log('Processed project data:', JSON.stringify(projectData, null, 2));
    
    // Check if record already exists
    const existing = await sql`
      SELECT id, isim FROM projeler WHERE airtable_id = ${record.id}
    `;
    
    console.log('Existing records:', existing);
    
    // Delete existing if found
    if (existing.length > 0) {
      await sql`DELETE FROM projeler WHERE airtable_id = ${record.id}`;
      console.log('Deleted existing record');
    }
    
    // Insert the record
    console.log('Inserting new record...');
    const result = await sql`
      INSERT INTO projeler (
        airtable_id, isim, slug, aciklama, musteri, konum, tarih,
        resim_url, kategori, hizmetler, markalar, durum, onemli,
        galeri, etiketler, aktif, sira, olusturma_tarihi, guncelleme_tarihi
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
      ) RETURNING id, isim, slug
    `;
    
    console.log('Insert result:', result);
    
    // Verify the record was inserted
    const verification = await sql`
      SELECT * FROM projeler WHERE airtable_id = ${record.id}
    `;
    
    console.log('Verification result:', verification);
    
    return NextResponse.json({
      success: true,
      message: 'Single project test completed',
      airtableData: {
        id: record.id,
        fields: fields
      },
      processedData: projectData,
      insertResult: result[0],
      verification: verification[0]
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}