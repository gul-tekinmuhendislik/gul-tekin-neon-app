import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Get sync statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN image_sync_status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN image_sync_status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN image_sync_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN cloudinary_resim_url IS NOT NULL THEN 1 END) as with_cloudinary_main,
        COUNT(CASE WHEN cloudinary_galeri::jsonb != '[]'::jsonb THEN 1 END) as with_cloudinary_gallery
      FROM projeler_gul_tekin
    `;
    
    // Get successfully synced projects
    const syncedProjects = await sql`
      SELECT 
        id, isim, 
        cloudinary_resim_url,
        cloudinary_public_id,
        cloudinary_galeri,
        image_sync_status,
        image_sync_date
      FROM projeler_gul_tekin
      WHERE image_sync_status = 'completed'
      ORDER BY image_sync_date DESC
      LIMIT 5
    `;
    
    // Get projects that still need sync
    const pendingProjects = await sql`
      SELECT 
        id, isim, resim_url,
        array_length(galeri, 1) as gallery_count,
        image_sync_status
      FROM projeler_gul_tekin
      WHERE image_sync_status = 'pending'
        AND ((resim_url IS NOT NULL AND resim_url != '') OR array_length(galeri, 1) > 0)
      ORDER BY id
      LIMIT 5
    `;
    
    return NextResponse.json({
      success: true,
      statistics: {
        total: parseInt(stats[0].total),
        completed: parseInt(stats[0].completed),
        failed: parseInt(stats[0].failed),
        pending: parseInt(stats[0].pending),
        withCloudinaryMain: parseInt(stats[0].with_cloudinary_main),
        withCloudinaryGallery: parseInt(stats[0].with_cloudinary_gallery),
        completionRate: Math.round((parseInt(stats[0].completed) / parseInt(stats[0].total)) * 100) + '%'
      },
      syncedProjects: syncedProjects.map(p => ({
        id: p.id,
        name: p.isim,
        cloudinaryMainUrl: p.cloudinary_resim_url,
        cloudinaryPublicId: p.cloudinary_public_id,
        galleryCount: p.cloudinary_galeri ? (
          typeof p.cloudinary_galeri === 'string' 
            ? (p.cloudinary_galeri.startsWith('[') ? JSON.parse(p.cloudinary_galeri).length : 0)
            : p.cloudinary_galeri.length
        ) : 0,
        syncDate: p.image_sync_date
      })),
      pendingProjects: pendingProjects.map(p => ({
        id: p.id,
        name: p.isim,
        hasMainImage: !!p.resim_url,
        galleryCount: p.gallery_count || 0,
        status: p.image_sync_status
      }))
    });
    
  } catch (error) {
    console.error('Error checking Cloudinary sync:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}