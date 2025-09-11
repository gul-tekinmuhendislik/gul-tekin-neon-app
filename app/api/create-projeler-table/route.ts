import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Create projeler table
    await sql`
      CREATE TABLE IF NOT EXISTS projeler (
        id SERIAL PRIMARY KEY,
        airtable_id TEXT UNIQUE NOT NULL,
        isim TEXT NOT NULL,
        slug TEXT UNIQUE,
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

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_projeler_airtable_id ON projeler(airtable_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_projeler_slug ON projeler(slug);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_projeler_aktif ON projeler(aktif);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_projeler_onemli ON projeler(onemli);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_projeler_sira ON projeler(sira);
    `;

    // Create updated_at trigger
    await sql`
      CREATE OR REPLACE FUNCTION update_projeler_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.guncelleme_tarihi = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await sql`
      DROP TRIGGER IF EXISTS set_projeler_updated_at ON projeler;
    `;

    await sql`
      CREATE TRIGGER set_projeler_updated_at
      BEFORE UPDATE ON projeler
      FOR EACH ROW
      EXECUTE FUNCTION update_projeler_updated_at();
    `;

    // Verify table creation
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'projeler'
    `;

    // Get table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'projeler'
      ORDER BY ordinal_position
    `;

    return NextResponse.json({
      success: true,
      message: 'Projeler table created successfully',
      table_exists: tables.length > 0,
      columns: columns,
    });
  } catch (error) {
    console.error('Error creating projeler table:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Add image sync columns if they don't exist
    await sql`
      ALTER TABLE projeler 
      ADD COLUMN IF NOT EXISTS cloudinary_resim_url TEXT,
      ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT,
      ADD COLUMN IF NOT EXISTS cloudinary_galeri JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS image_sync_status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS image_sync_date TIMESTAMP
    `.catch(() => {
      // Ignore error if columns already exist
    });

    // Verify columns were added
    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'projeler'
      AND column_name IN ('cloudinary_resim_url', 'cloudinary_public_id', 'cloudinary_galeri', 'image_sync_status', 'image_sync_date')
    `;

    return NextResponse.json({
      success: true,
      message: 'Image sync columns added successfully',
      columns_added: columns.map(c => c.column_name),
    });
  } catch (error) {
    console.error('Error adding image sync columns:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}