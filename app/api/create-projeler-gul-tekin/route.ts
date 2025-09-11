import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('Creating projeler_gul_tekin table...');
    
    // Drop table if exists (optional - comment out if you want to keep existing data)
    await sql`DROP TABLE IF EXISTS projeler_gul_tekin CASCADE`;
    
    // Create new clean table with proper schema
    await sql`
      CREATE TABLE projeler_gul_tekin (
        id SERIAL PRIMARY KEY,
        airtable_id TEXT UNIQUE NOT NULL,
        proje_adi TEXT NOT NULL,
        slug TEXT UNIQUE,
        aciklama TEXT,
        mahalle TEXT,
        ilce TEXT,
        baslangic_tarihi DATE,
        bitis_tarihi DATE,
        proje_yili TEXT,
        ana_faaliyet_konusu TEXT[],
        
        -- Original Airtable image URLs
        airtable_resim_url TEXT,
        airtable_galeri_urls TEXT[],
        
        -- Cloudinary fields
        cloudinary_url TEXT,
        cloudinary_public_id TEXT,
        cloudinary_galeri_urls TEXT[],
        cloudinary_galeri_public_ids TEXT[],
        
        -- Metadata
        aktif BOOLEAN DEFAULT true,
        sira INTEGER DEFAULT 999,
        airtable_last_modified TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes for better performance
    await sql`CREATE INDEX idx_projeler_gul_tekin_airtable_id ON projeler_gul_tekin(airtable_id)`;
    await sql`CREATE INDEX idx_projeler_gul_tekin_slug ON projeler_gul_tekin(slug)`;
    await sql`CREATE INDEX idx_projeler_gul_tekin_aktif ON projeler_gul_tekin(aktif)`;
    await sql`CREATE INDEX idx_projeler_gul_tekin_cloudinary_url ON projeler_gul_tekin(cloudinary_url)`;
    
    // Check table structure
    const columns = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'projeler_gul_tekin'
      ORDER BY ordinal_position
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Table projeler_gul_tekin created successfully',
      columns: columns,
      indexes: [
        'idx_projeler_gul_tekin_airtable_id',
        'idx_projeler_gul_tekin_slug',
        'idx_projeler_gul_tekin_aktif',
        'idx_projeler_gul_tekin_cloudinary_url'
      ]
    });
  } catch (error) {
    console.error('Error creating projeler_gul_tekin table:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}