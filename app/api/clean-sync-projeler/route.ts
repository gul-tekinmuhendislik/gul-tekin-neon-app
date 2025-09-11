import { NextResponse } from 'next/server';
import { getAllProjeler } from '@/lib/airtable-projeler-client';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('🧹 Starting clean sync of all projects...');
    
    // 1. Clear ALL existing data
    console.log('🗑️  Clearing ALL existing data...');
    await sql`DELETE FROM projeler`;
    
    // 2. Get records from Airtable
    console.log('📋 Fetching records from Airtable...');
    const records = await getAllProjeler();
    console.log(`✅ Found ${records.length} records from Airtable`);
    
    let inserted = 0;
    let skipped = 0;
    
    // 3. Process each record carefully
    for (const record of records) {
      // Skip invalid records
      if (!record.id || !record.fields) {
        skipped++;
        continue;
      }
      
      const fields = record.fields;
      
      // Skip if no project name
      if (!fields['Proje Adı'] || fields['Proje Adı'].trim() === '') {
        skipped++;
        continue;
      }
      
      try {
        // Process images
        const mainImage = fields['Resimler']?.[0]?.url || null;
        const galleryImages = fields['Resimler']?.map(img => img.url) || [];
        
        // Generate slug
        const slug = fields['SEO:slug'] || 
                   fields['Proje Adı']
                     ?.toLowerCase()
                     ?.replace(/\s+/g, '-')
                     ?.replace(/[^a-z0-9-]/g, '') || 
                   record.id.substring(0, 8);
        
        await sql`
          INSERT INTO projeler (
            airtable_id, isim, slug, aciklama, musteri, konum, tarih,
            resim_url, kategori, hizmetler, markalar, durum, onemli,
            galeri, etiketler, aktif, sira, olusturma_tarihi, guncelleme_tarihi
          ) VALUES (
            ${record.id},
            ${fields['Proje Adı']},
            ${slug},
            ${fields['Açıklama'] || ''},
            ${fields['Mahalle Adı'] || ''},
            ${fields['İlçe Adı'] || ''},
            ${fields['Proje Başlangıç Tarihi'] || null},
            ${mainImage},
            ${fields['Ana faaliyet Konusu']?.[0] || ''},
            ${fields['Ana faaliyet Konusu'] || []},
            ${[]},
            'Tamamlandı',
            false,
            ${galleryImages},
            ${[fields['Proje Yılı']].filter(Boolean)},
            true,
            ${inserted}, -- Use inserted count as order
            NOW(),
            NOW()
          )
        `;
        
        inserted++;
        
        // Progress every 50
        if (inserted % 50 === 0) {
          console.log(`✅ ${inserted} projects inserted...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting ${fields['Proje Adı']}:`, error);
        skipped++;
      }
    }
    
    console.log(`🎉 Clean sync completed!`);
    console.log(`✅ Inserted: ${inserted}`);
    console.log(`⚠️  Skipped: ${skipped}`);
    
    return NextResponse.json({
      success: true,
      message: 'Clean sync completed successfully',
      results: {
        total: records.length,
        inserted,
        skipped,
        successRate: Math.round((inserted / records.length) * 100) + '%'
      }
    });
    
  } catch (error) {
    console.error('❌ Clean sync error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}