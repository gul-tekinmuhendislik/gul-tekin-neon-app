import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { type = 'both', limit = 10 } = await request.json();
    
    console.log(`🚀 Starting bulk sync for ${type}, limit: ${limit}`);
    
    const results = {
      markalar: { 
        processed: 0, 
        succeeded: 0, 
        failed: 0, 
        skipped: 0, 
        errors: [] as Array<{brand: string; error: string}>
      },
      hizmetler: { 
        processed: 0, 
        succeeded: 0, 
        failed: 0, 
        skipped: 0, 
        errors: [] as Array<{service: string; error: string}>
      },
      summary: { total: 0, totalSucceeded: 0, totalFailed: 0, totalSkipped: 0 }
    };
    
    // Sync Brands (Markalar)
    if (type === 'both' || type === 'markalar') {
      console.log('📤 Syncing brands to Cloudinary...');
      
      const brands = await sql`
        SELECT id, marka_adi, logo_url, cloudinary_url, cloudinary_public_id
        FROM markalar 
        WHERE logo_url IS NOT NULL 
          AND (cloudinary_url IS NULL OR cloudinary_url = '')
        ORDER BY marka_adi
        LIMIT ${limit}
      `;
      
      console.log(`Found ${brands.length} brands to sync`);
      
      for (const brand of brands) {
        results.markalar.processed++;
        
        try {
          console.log(`📤 Uploading ${brand.marka_adi}...`);
          
          const cloudinaryResult = await uploadToCloudinary(brand.logo_url, {
            folder: "markalar",
            public_id: `marka-${brand.id}-${Date.now()}`,
            tags: ["marka", "logo", brand.marka_adi.toLowerCase().replace(/[^a-z0-9]/g, '')],
            quality: "auto:good",
            width: 400,
            height: 400,
            crop: "pad",
            background: "white"
          });
          
          if (!cloudinaryResult.success || !cloudinaryResult.data) {
            throw new Error(cloudinaryResult.error || 'Upload failed');
          }
          
          // Update database
          await sql`
            UPDATE markalar 
            SET 
              cloudinary_url = ${cloudinaryResult.data.url},
              cloudinary_public_id = ${cloudinaryResult.data.public_id},
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${brand.id}
          `;
          
          console.log(`✅ ${brand.marka_adi} synced successfully`);
          results.markalar.succeeded++;
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Failed to sync ${brand.marka_adi}:`, error);
          results.markalar.failed++;
          results.markalar.errors.push({
            brand: brand.marka_adi,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
    
    // Sync Services (Hizmetler)
    if (type === 'both' || type === 'hizmetler') {
      console.log('📤 Syncing services to Cloudinary...');
      
      const services = await sql`
        SELECT id, hizmet_adi, resim_url, cloudinary_url, cloudinary_public_id
        FROM hizmetler 
        WHERE resim_url IS NOT NULL 
          AND (cloudinary_url IS NULL OR cloudinary_url = '')
        ORDER BY hizmet_adi
        LIMIT ${limit}
      `;
      
      console.log(`Found ${services.length} services to sync`);
      
      for (const service of services) {
        results.hizmetler.processed++;
        
        try {
          console.log(`📤 Uploading ${service.hizmet_adi}...`);
          
          const cloudinaryResult = await uploadToCloudinary(service.resim_url, {
            folder: "hizmetler",
            public_id: `hizmet-${service.id}-${Date.now()}`,
            tags: ["hizmet", "service", service.hizmet_adi.toLowerCase().replace(/[^a-z0-9]/g, '')],
            quality: "auto:good",
            width: 600,
            height: 400,
            crop: "fill"
          });
          
          if (!cloudinaryResult.success || !cloudinaryResult.data) {
            throw new Error(cloudinaryResult.error || 'Upload failed');
          }
          
          // Update database
          await sql`
            UPDATE hizmetler 
            SET 
              cloudinary_url = ${cloudinaryResult.data.url},
              cloudinary_public_id = ${cloudinaryResult.data.public_id},
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${service.id}
          `;
          
          console.log(`✅ ${service.hizmet_adi} synced successfully`);
          results.hizmetler.succeeded++;
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Failed to sync ${service.hizmet_adi}:`, error);
          results.hizmetler.failed++;
          results.hizmetler.errors.push({
            service: service.hizmet_adi,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
    
    // Calculate summary
    results.summary.total = results.markalar.processed + results.hizmetler.processed;
    results.summary.totalSucceeded = results.markalar.succeeded + results.hizmetler.succeeded;
    results.summary.totalFailed = results.markalar.failed + results.hizmetler.failed;
    results.summary.totalSkipped = results.markalar.skipped + results.hizmetler.skipped;
    
    console.log(`🎉 Bulk sync completed: ${results.summary.totalSucceeded}/${results.summary.total} successful`);
    
    return NextResponse.json({
      success: true,
      message: `Bulk sync completed: ${results.summary.totalSucceeded}/${results.summary.total} successful`,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Bulk sync failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Bulk sync failed'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Bulk sync all images to Cloudinary',
    usage: {
      method: 'POST',
      body: { 
        type: 'both | markalar | hizmetler',
        limit: 'number (default: 10)'
      },
      examples: [
        { type: 'both', limit: 20 },
        { type: 'markalar', limit: 45 },
        { type: 'hizmetler', limit: 13 }
      ]
    }
  });
}