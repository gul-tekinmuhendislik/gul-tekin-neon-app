import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAllProjeler } from '@/lib/airtable-projeler-client';

export async function GET() {
  try {
    console.log('🆕 Creating projeler_gul_tekin table...');
    
    // 1. Create new table
    await sql`
      CREATE TABLE IF NOT EXISTS projeler_gul_tekin (
        id SERIAL PRIMARY KEY,
        airtable_id TEXT UNIQUE NOT NULL,
        isim TEXT NOT NULL,
        slug TEXT,
        aciklama TEXT,
        musteri TEXT,
        konum TEXT,
        tarih DATE,
        resim_url TEXT,
        kategori TEXT,
        hizmetler TEXT[] DEFAULT '{}',
        markalar TEXT[] DEFAULT '{}',
        durum TEXT DEFAULT 'Tamamlandı',
        onemli BOOLEAN DEFAULT false,
        galeri TEXT[] DEFAULT '{}',
        etiketler TEXT[] DEFAULT '{}',
        aktif BOOLEAN DEFAULT true,
        sira INTEGER DEFAULT 0,
        olusturma_tarihi TIMESTAMP DEFAULT NOW(),
        guncelleme_tarihi TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ Table projeler_gul_tekin created');
    
    // 2. Add indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_projeler_gul_tekin_airtable_id ON projeler_gul_tekin(airtable_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projeler_gul_tekin_slug ON projeler_gul_tekin(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projeler_gul_tekin_aktif ON projeler_gul_tekin(aktif)`;
    
    console.log('✅ Indexes created');
    
    // 3. Get records from Airtable and insert
    console.log('📋 Fetching and inserting records...');
    const records = await getAllProjeler();
    console.log(`Found ${records.length} records from Airtable`);
    
    let inserted = 0;
    let skipped = 0;
    
    for (const record of records) {
      if (!record.id || !record.fields || !record.fields['Proje Adı']) {
        skipped++;
        continue;
      }
      
      const fields = record.fields;
      
      try {
        // Process data
        const mainImage = fields['Resimler']?.[0]?.url || null;
        const galleryImages = fields['Resimler']?.map(img => img.url) || [];
        const slug = fields['SEO:slug'] || 
                     fields['Proje Adı']?.toLowerCase()?.replace(/\s+/g, '-')?.replace(/[^a-z0-9-]/g, '') || 
                     record.id.substring(0, 8);
        
        await sql`
          INSERT INTO projeler_gul_tekin (
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
            ${inserted},
            NOW(),
            NOW()
          )
        `;
        
        inserted++;
        
        if (inserted % 50 === 0) {
          console.log(`✅ ${inserted} projects inserted...`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting ${fields['Proje Adı']}:`, error);
        skipped++;
      }
    }
    
    // 4. Get final count and sample
    const totalCount = await sql`SELECT COUNT(*) as count FROM projeler_gul_tekin`;
    const sampleRecords = await sql`
      SELECT id, airtable_id, isim, konum, tarih
      FROM projeler_gul_tekin
      WHERE isim IS NOT NULL AND isim != ''
      ORDER BY tarih DESC
      LIMIT 5
    `;
    
    console.log(`🎉 Table projeler_gul_tekin ready with ${totalCount[0].count} records!`);
    
    return NextResponse.json({
      success: true,
      message: 'Table projeler_gul_tekin created and populated successfully',
      results: {
        tableCreated: true,
        totalFromAirtable: records.length,
        inserted,
        skipped,
        finalCount: parseInt(totalCount[0].count),
        successRate: Math.round((inserted / records.length) * 100) + '%'
      },
      sampleRecords
    });
    
  } catch (error) {
    console.error('❌ Error creating projeler_gul_tekin:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}