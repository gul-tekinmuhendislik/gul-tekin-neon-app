import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { serviceId } = await request.json();
    
    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
    }
    
    console.log(`🔄 Syncing service ${serviceId} to Cloudinary...`);
    
    // Get service from database
    const service = await sql`
      SELECT id, hizmet_adi, resim_url, cloudinary_url, cloudinary_public_id
      FROM hizmetler 
      WHERE id = ${serviceId} 
      LIMIT 1
    `;
    
    if (service.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    const serviceData = service[0];
    
    if (!serviceData.resim_url) {
      return NextResponse.json({ error: 'No image URL found for this service' }, { status: 400 });
    }
    
    if (serviceData.cloudinary_url) {
      return NextResponse.json({ 
        success: true, 
        message: 'Service already synced to Cloudinary',
        result: {
          service: serviceData.hizmet_adi,
          cloudinaryUrl: serviceData.cloudinary_url,
          publicId: serviceData.cloudinary_public_id
        }
      });
    }
    
    // Upload to Cloudinary
    console.log(`📤 Uploading ${serviceData.hizmet_adi} image to Cloudinary...`);
    
    const cloudinaryResult = await uploadToCloudinary(serviceData.resim_url, {
      folder: "hizmetler",
      public_id: `hizmet-${serviceData.id}-${Date.now()}`,
      tags: ["hizmet", "service", serviceData.hizmet_adi.toLowerCase()],
      quality: "auto:good",
      width: 600,
      height: 400,
      crop: "fill"
    });
    
    console.log(`✅ ${serviceData.hizmet_adi} uploaded to Cloudinary:`, cloudinaryResult);
    
    if (!cloudinaryResult.success || !cloudinaryResult.data) {
      return NextResponse.json(
        { error: cloudinaryResult.error || 'Upload failed' },
        { status: 500 }
      );
    }
    
    // Update database
    await sql`
      UPDATE hizmetler 
      SET 
        cloudinary_url = ${cloudinaryResult.data.url},
        cloudinary_public_id = ${cloudinaryResult.data.public_id},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${serviceId}
      RETURNING id, hizmet_adi, cloudinary_url, cloudinary_public_id
    `;
    
    console.log(`✅ Database updated for ${serviceData.hizmet_adi}`);
    
    return NextResponse.json({
      success: true,
      message: `${serviceData.hizmet_adi} synced to Cloudinary successfully`,
      result: {
        service: serviceData.hizmet_adi,
        originalUrl: serviceData.resim_url,
        cloudinaryUrl: cloudinaryResult.data.url,
        publicId: cloudinaryResult.data.public_id,
        width: cloudinaryResult.data.width,
        height: cloudinaryResult.data.height,
        format: cloudinaryResult.data.format,
        bytes: cloudinaryResult.data.bytes
      }
    });
    
  } catch (error) {
    console.error('❌ Service sync failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Service sync failed'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Single service sync to Cloudinary',
    usage: {
      method: 'POST',
      body: { serviceId: 'string' },
      example: { serviceId: 'recMyVPSCiraSRYro' }
    }
  });
}