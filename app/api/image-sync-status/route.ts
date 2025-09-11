import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Check markalar with images
    const markalarStatus = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN logo_url IS NOT NULL THEN 1 END) as with_airtable_image,
        COUNT(CASE WHEN cloudinary_url IS NOT NULL THEN 1 END) as with_cloudinary_image,
        COUNT(CASE WHEN logo_url IS NOT NULL AND cloudinary_url IS NULL THEN 1 END) as pending_sync
      FROM markalar
      WHERE aktif = true
    `;

    // Check hizmetler with images  
    const hizmetlerStatus = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN resim_url IS NOT NULL THEN 1 END) as with_airtable_image,
        COUNT(CASE WHEN cloudinary_url IS NOT NULL THEN 1 END) as with_cloudinary_image,
        COUNT(CASE WHEN resim_url IS NOT NULL AND cloudinary_url IS NULL THEN 1 END) as pending_sync
      FROM hizmetler
      WHERE aktif = true
    `;

    // Recent image sync events
    const recentSyncEvents = await sql`
      SELECT 
        event_name,
        status,
        payload,
        metadata,
        created_at
      FROM event_logs
      WHERE event_name LIKE '%image%' OR event_name LIKE '%cloudinary%'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Sample markalar with/without Cloudinary URLs
    const sampleMarkalar = await sql`
      SELECT 
        id,
        marka_adi,
        logo_url,
        cloudinary_url,
        cloudinary_public_id,
        updated_at
      FROM markalar
      WHERE aktif = true
        AND (logo_url IS NOT NULL OR cloudinary_url IS NOT NULL)
      ORDER BY updated_at DESC
      LIMIT 5
    `;

    // Sample hizmetler with/without Cloudinary URLs
    const sampleHizmetler = await sql`
      SELECT 
        id,
        hizmet_adi,
        resim_url,
        cloudinary_url,
        cloudinary_public_id,
        updated_at
      FROM hizmetler
      WHERE aktif = true
        AND (resim_url IS NOT NULL OR cloudinary_url IS NOT NULL)
      ORDER BY updated_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      status: {
        markalar: {
          total: parseInt(markalarStatus[0].total),
          withAirtableImage: parseInt(markalarStatus[0].with_airtable_image),
          withCloudinaryImage: parseInt(markalarStatus[0].with_cloudinary_image),
          pendingSync: parseInt(markalarStatus[0].pending_sync)
        },
        hizmetler: {
          total: parseInt(hizmetlerStatus[0].total),
          withAirtableImage: parseInt(hizmetlerStatus[0].with_airtable_image),
          withCloudinaryImage: parseInt(hizmetlerStatus[0].with_cloudinary_image),
          pendingSync: parseInt(hizmetlerStatus[0].pending_sync)
        }
      },
      recentEvents: recentSyncEvents.map(event => ({
        eventName: event.event_name,
        status: event.status,
        createdAt: event.created_at,
        payload: event.payload,
        metadata: event.metadata
      })),
      samples: {
        markalar: sampleMarkalar.map(m => ({
          id: m.id,
          name: m.marka_adi,
          airtableImageUrl: m.logo_url,
          cloudinaryUrl: m.cloudinary_url,
          publicId: m.cloudinary_public_id,
          updatedAt: m.updated_at,
          synced: !!m.cloudinary_url
        })),
        hizmetler: sampleHizmetler.map(h => ({
          id: h.id,
          name: h.hizmet_adi,
          airtableImageUrl: h.resim_url,
          cloudinaryUrl: h.cloudinary_url,
          publicId: h.cloudinary_public_id,
          updatedAt: h.updated_at,
          synced: !!h.cloudinary_url
        }))
      }
    });

  } catch (error) {
    console.error('Error checking image sync status:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to check image sync status'
      },
      { status: 500 }
    );
  }
}