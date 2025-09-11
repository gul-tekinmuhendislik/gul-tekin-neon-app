import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    console.log('Starting database migration for Cloudinary columns and metadata...');
    
    // Add metadata column to generated_content table (MOST IMPORTANT)
    console.log('🔧 Adding metadata column to generated_content table...');
    
    const columnExists = await sql`
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'generated_content' 
        AND column_name = 'metadata'
    `;
    
    let metadataMigration = { success: true, message: 'Column already exists' };
    if (columnExists.length === 0) {
      await sql`
        ALTER TABLE generated_content 
        ADD COLUMN metadata JSONB DEFAULT '{}'
      `;
      
      await sql`
        COMMENT ON COLUMN generated_content.metadata IS 'Additional metadata for content (E-E-A-T analysis, SEO, social media, etc.)'
      `;
      
      metadataMigration = { success: true, message: 'Column added successfully' };
      console.log('✅ Metadata column added to generated_content table');
    } else {
      console.log('✅ Metadata column already exists in generated_content table');
    }
    
    // Add Cloudinary columns to markalar table
    const markalarMigration = await sql`
      ALTER TABLE markalar 
      ADD COLUMN IF NOT EXISTS cloudinary_url TEXT,
      ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT
    `.catch((error) => {
      // If error is about existing columns, that's OK
      if (error.message.includes('already exists')) {
        console.log('Cloudinary columns already exist in markalar table');
        return { success: true };
      }
      throw error;
    });

    // Add Cloudinary columns to hizmetler table
    const hizmetlerMigration = await sql`
      ALTER TABLE hizmetler 
      ADD COLUMN IF NOT EXISTS cloudinary_url TEXT,
      ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT
    `.catch((error) => {
      // If error is about existing columns, that's OK
      if (error.message.includes('already exists')) {
        console.log('Cloudinary columns already exist in hizmetler table');
        return { success: true };
      }
      throw error;
    });

    // Check if columns were added successfully
    const markalarColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'markalar' 
        AND (column_name = 'cloudinary_url' OR column_name = 'cloudinary_public_id')
    `;

    const hizmetlerColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hizmetler' 
        AND (column_name = 'cloudinary_url' OR column_name = 'cloudinary_public_id')
    `;

    // Get table stats
    const markalarStats = await sql`
      SELECT COUNT(*) as total FROM markalar
    `;

    const hizmetlerStats = await sql`
      SELECT COUNT(*) as total FROM hizmetler  
    `;

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      results: {
        generated_content: {
          metadata_migration: metadataMigration,
          hasMetadata: columnExists.length > 0
        },
        markalar: {
          migration: markalarMigration,
          columnsAdded: markalarColumns.map(c => c.column_name),
          totalRecords: parseInt(markalarStats[0].total)
        },
        hizmetler: {
          migration: hizmetlerMigration,
          columnsAdded: hizmetlerColumns.map(c => c.column_name),
          totalRecords: parseInt(hizmetlerStats[0].total)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database migration error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Database migration failed'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database migration endpoint',
    usage: 'POST to run migration',
    description: 'Adds metadata column to generated_content table and cloudinary_url/cloudinary_public_id columns to markalar and hizmetler tables'
  });
}