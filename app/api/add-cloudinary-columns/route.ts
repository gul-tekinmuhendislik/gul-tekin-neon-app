import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔧 Adding Cloudinary columns to projeler_gul_tekin...');
    
    // Add new columns for Cloudinary data
    await sql`
      ALTER TABLE projeler_gul_tekin 
      ADD COLUMN IF NOT EXISTS cloudinary_resim_url TEXT,
      ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT,
      ADD COLUMN IF NOT EXISTS cloudinary_galeri JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS image_sync_status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS image_sync_date TIMESTAMP
    `;
    
    console.log('✅ Cloudinary columns added');
    
    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_projeler_gul_tekin_cloudinary_status ON projeler_gul_tekin(image_sync_status);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_projeler_gul_tekin_cloudinary_date ON projeler_gul_tekin(image_sync_date);
    `;
    
    console.log('✅ Indexes created');
    
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'projeler_gul_tekin'
      AND column_name LIKE '%cloudinary%' OR column_name LIKE '%image_sync%'
      ORDER BY column_name
    `;
    
    // Count projects that need image sync
    const needsSync = await sql`
      SELECT COUNT(*) as count 
      FROM projeler_gul_tekin 
      WHERE (resim_url IS NOT NULL AND resim_url != '')
        OR (array_length(galeri, 1) > 0)
    `;
    
    console.log(`📊 Found ${needsSync[0].count} projects with images to sync`);
    
    return NextResponse.json({
      success: true,
      message: 'Cloudinary columns added successfully',
      newColumns: columns,
      projectsNeedingSync: parseInt(needsSync[0].count),
    });
    
  } catch (error) {
    console.error('❌ Error adding Cloudinary columns:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}