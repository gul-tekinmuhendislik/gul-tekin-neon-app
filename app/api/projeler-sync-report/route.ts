import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Get overall statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN image_sync_status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN image_sync_status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN image_sync_status = 'pending' OR image_sync_status IS NULL THEN 1 END) as pending,
        COUNT(CASE WHEN cloudinary_resim_url IS NOT NULL THEN 1 END) as has_main_image,
        COUNT(CASE WHEN cloudinary_galeri IS NOT NULL AND cloudinary_galeri::text != '[]' THEN 1 END) as has_gallery
      FROM projeler_2026
    `;
    
    // Get projects with images that need sync
    const needsSync = await sql`
      SELECT 
        id, 
        isim,
        resim_url,
        CASE 
          WHEN resim_url IS NOT NULL THEN 'Has original image'
          ELSE 'No original image'
        END as original_status,
        CASE 
          WHEN cloudinary_resim_url IS NOT NULL THEN 'Synced'
          ELSE 'Not synced'
        END as cloudinary_status,
        image_sync_status
      FROM projeler_2026
      WHERE (resim_url IS NOT NULL AND resim_url != '')
        AND (cloudinary_resim_url IS NULL OR cloudinary_resim_url = '')
      LIMIT 10
    `;
    
    // Get successfully synced projects
    const synced = await sql`
      SELECT 
        id, 
        isim,
        cloudinary_resim_url,
        image_sync_status,
        image_sync_date
      FROM projeler_2026
      WHERE cloudinary_resim_url IS NOT NULL
      ORDER BY image_sync_date DESC NULLS LAST
      LIMIT 10
    `;
    
    return NextResponse.json({
      success: true,
      summary: {
        total: parseInt(stats[0].total),
        completed: parseInt(stats[0].completed),
        failed: parseInt(stats[0].failed),
        pending: parseInt(stats[0].pending),
        hasCloudinaryMainImage: parseInt(stats[0].has_main_image),
        hasCloudinaryGallery: parseInt(stats[0].has_gallery),
        completionRate: Math.round((parseInt(stats[0].has_main_image) / parseInt(stats[0].total)) * 100) + '%'
      },
      needsSync: needsSync.map(p => ({
        id: p.id,
        name: p.isim,
        hasOriginalImage: !!p.resim_url,
        originalStatus: p.original_status,
        cloudinaryStatus: p.cloudinary_status,
        syncStatus: p.image_sync_status || 'not_started'
      })),
      recentlySynced: synced.map(p => ({
        id: p.id,
        name: p.isim,
        cloudinaryUrl: p.cloudinary_resim_url,
        syncStatus: p.image_sync_status,
        syncDate: p.image_sync_date
      }))
    });
    
  } catch (error) {
    console.error('Error generating sync report:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}