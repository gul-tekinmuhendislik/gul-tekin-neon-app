import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(imageUrl: string, folder: string, publicId?: string) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      public_id: publicId,
      overwrite: true,
      resource_type: 'auto',
      quality: 'auto:best',
      fetch_format: 'auto',
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    console.log('🖼️ Starting image sync for projeler...');
    
    // Get projects that need image sync
    const projects = await sql`
      SELECT 
        id, airtable_id, isim, resim_url, galeri
      FROM projeler_2026 
      WHERE ((resim_url IS NOT NULL AND resim_url != '')
        OR (array_length(galeri, 1) > 0))
        AND (image_sync_status IS NULL OR image_sync_status != 'completed')
      ORDER BY id
      LIMIT ${limit}
    `;
    
    console.log(`Found ${projects.length} projects with images`);
    
    let processed = 0;
    let mainImagesUploaded = 0;
    let galleryImagesUploaded = 0;
    let errors = 0;
    
    for (const project of projects) {
      console.log(`\n📋 Processing: ${project.isim} (ID: ${project.id})`);
      
      try {
        let cloudinaryMainUrl = null;
        let cloudinaryMainPublicId = null;
        const cloudinaryGallery = [];
        
        // Upload main image
        if (project.resim_url) {
          console.log('📸 Uploading main image...');
          const mainImageResult = await uploadToCloudinary(
            project.resim_url,
            'projects/main',
            `project_${project.airtable_id}_main`
          );
          
          if (mainImageResult.success) {
            cloudinaryMainUrl = mainImageResult.url;
            cloudinaryMainPublicId = mainImageResult.public_id;
            mainImagesUploaded++;
            console.log(`✅ Main image uploaded: ${mainImageResult.public_id}`);
          } else {
            console.error(`❌ Main image failed: ${mainImageResult.error}`);
          }
        }
        
        // Upload gallery images
        if (project.galeri && project.galeri.length > 0) {
          console.log(`🖼️ Uploading ${project.galeri.length} gallery images...`);
          
          for (let i = 0; i < project.galeri.length; i++) {
            const galleryUrl = project.galeri[i];
            
            const galleryResult = await uploadToCloudinary(
              galleryUrl,
              'projects/gallery',
              `project_${project.airtable_id}_gallery_${i + 1}`
            );
            
            if (galleryResult.success) {
              cloudinaryGallery.push({
                url: galleryResult.url,
                public_id: galleryResult.public_id,
                width: galleryResult.width,
                height: galleryResult.height,
                format: galleryResult.format,
                order: i + 1,
              });
              galleryImagesUploaded++;
              console.log(`✅ Gallery image ${i + 1} uploaded`);
            } else {
              console.error(`❌ Gallery image ${i + 1} failed: ${galleryResult.error}`);
            }
            
            // Small delay between uploads
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        // Update database with Cloudinary URLs
        await sql`
          UPDATE projeler_2026 SET
            cloudinary_resim_url = ${cloudinaryMainUrl},
            cloudinary_public_id = ${cloudinaryMainPublicId},
            cloudinary_galeri = ${JSON.stringify(cloudinaryGallery)},
            image_sync_status = 'completed',
            image_sync_date = NOW(),
            guncelleme_tarihi = NOW()
          WHERE id = ${project.id}
        `;
        
        processed++;
        console.log(`✅ Updated database for project ${project.id}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Error processing project ${project.id}:`, error);
        
        // Mark as failed in database
        try {
          await sql`
            UPDATE projeler_2026 SET
              image_sync_status = 'failed',
              image_sync_date = NOW()
            WHERE id = ${project.id}
          `;
        } catch (updateError) {
          console.error('Failed to update error status:', updateError);
        }
      }
      
      // Progress update
      if (processed % 5 === 0) {
        console.log(`\n📊 Progress: ${processed}/${projects.length} projects processed`);
      }
    }
    
    console.log('\n🎉 Image sync completed!');
    console.log(`📊 Results:`);
    console.log(`  - Projects processed: ${processed}`);
    console.log(`  - Main images uploaded: ${mainImagesUploaded}`);
    console.log(`  - Gallery images uploaded: ${galleryImagesUploaded}`);
    console.log(`  - Errors: ${errors}`);
    
    return NextResponse.json({
      success: true,
      message: 'Image sync completed',
      results: {
        projectsProcessed: processed,
        mainImagesUploaded,
        galleryImagesUploaded,
        totalImagesUploaded: mainImagesUploaded + galleryImagesUploaded,
        errors,
        successRate: Math.round((processed / projects.length) * 100) + '%',
      },
    });
    
  } catch (error) {
    console.error('❌ Image sync error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}