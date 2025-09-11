import { NextResponse } from 'next/server';
import { getAllProjeler } from '@/lib/airtable-projeler-client';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('Starting simple projeler sync...');
    
    // Clear existing data
    await sql`DELETE FROM projeler`;
    console.log('Cleared existing data');
    
    // Get records from Airtable
    const records = await getAllProjeler();
    console.log(`Found ${records.length} records`);
    
    let inserted = 0;
    let skipped = 0;
    
    // Process in smaller chunks
    for (let i = 0; i < records.length; i += 25) {
      const chunk = records.slice(i, i + 25);
      console.log(`Processing chunk ${Math.floor(i/25) + 1}/${Math.ceil(records.length/25)}`);
      
      for (const record of chunk) {
        if (!record.id || !record.fields) {
          skipped++;
          continue;
        }
        
        const fields = record.fields;
        
        try {
          // Simple processing
          const mainImage = fields['Resimler']?.[0]?.url || null;
          const galleryImages = fields['Resimler']?.map(img => img.url) || [];
          const slug = fields['SEO:slug'] || fields['Proje Adı']?.toLowerCase()?.replace(/\s+/g, '-')?.replace(/[^a-z0-9-]/g, '') || record.id.substring(0, 8);
          
          await sql`
            INSERT INTO projeler (
              airtable_id, isim, slug, aciklama, musteri, konum, tarih,
              resim_url, kategori, hizmetler, markalar, durum, onemli,
              galeri, etiketler, aktif, sira, olusturma_tarihi, guncelleme_tarihi
            ) VALUES (
              ${record.id},
              ${fields['Proje Adı'] || ''},
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
              0,
              NOW(),
              NOW()
            )
          `;
          
          inserted++;
          
          if (inserted % 25 === 0) {
            console.log(`Inserted ${inserted} records so far...`);
          }
          
        } catch (error) {
          console.error(`Error inserting record ${record.id}:`, error);
          skipped++;
        }
      }
      
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Sync completed: ${inserted} inserted, ${skipped} skipped`);
    
    return NextResponse.json({
      success: true,
      message: 'Simple sync completed',
      inserted,
      skipped,
      total: records.length,
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}