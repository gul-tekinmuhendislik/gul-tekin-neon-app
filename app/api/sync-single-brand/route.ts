import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { brandId } = await request.json();
    
    if (!brandId) {
      return NextResponse.json({ error: 'brandId is required' }, { status: 400 });
    }
    
    console.log(`🔄 Syncing brand ${brandId} to Cloudinary...`);
    
    // Get brand from database
    const brand = await sql`
      SELECT id, marka_adi, logo_url, cloudinary_url, cloudinary_public_id
      FROM markalar 
      WHERE id = ${brandId} 
      LIMIT 1
    `;
    
    if (brand.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    
    const brandData = brand[0];
    
    if (!brandData.logo_url) {
      return NextResponse.json({ error: 'No logo URL found for this brand' }, { status: 400 });
    }
    
    if (brandData.cloudinary_url) {
      return NextResponse.json({ 
        success: true, 
        message: 'Brand already synced to Cloudinary',
        result: {
          brand: brandData.marka_adi,
          cloudinaryUrl: brandData.cloudinary_url,
          publicId: brandData.cloudinary_public_id
        }
      });
    }
    
    // Upload to Cloudinary
    console.log(`📤 Uploading ${brandData.marka_adi} logo to Cloudinary...`);
    
    const cloudinaryResult = await uploadToCloudinary(brandData.logo_url, {
      folder: "markalar",
      public_id: `marka-${brandData.id}-${Date.now()}`,
      tags: ["marka", "logo", brandData.marka_adi.toLowerCase()],
      quality: "auto:good",
      width: 400,
      height: 400,
      crop: "pad",
      background: "white"
    });
    
    console.log(`✅ ${brandData.marka_adi} uploaded to Cloudinary:`, cloudinaryResult);
    
    if (!cloudinaryResult.success || !cloudinaryResult.data) {
      return NextResponse.json(
        { error: cloudinaryResult.error || 'Upload failed' },
        { status: 500 }
      );
    }
    
    // Update database
    await sql`
      UPDATE markalar 
      SET 
        cloudinary_url = ${cloudinaryResult.data.url},
        cloudinary_public_id = ${cloudinaryResult.data.public_id},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${brandId}
      RETURNING id, marka_adi, cloudinary_url, cloudinary_public_id
    `;
    
    console.log(`✅ Database updated for ${brandData.marka_adi}`);
    
    return NextResponse.json({
      success: true,
      message: `${brandData.marka_adi} synced to Cloudinary successfully`,
      result: {
        brand: brandData.marka_adi,
        originalUrl: brandData.logo_url,
        cloudinaryUrl: cloudinaryResult.data.url,
        publicId: cloudinaryResult.data.public_id,
        width: cloudinaryResult.data.width,
        height: cloudinaryResult.data.height,
        format: cloudinaryResult.data.format,
        bytes: cloudinaryResult.data.bytes
      }
    });
    
  } catch (error) {
    console.error('❌ Brand sync failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Brand sync failed'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Single brand sync to Cloudinary',
    usage: {
      method: 'POST',
      body: { brandId: 'string' },
      example: { brandId: 'recu1hxL7Lvs4mway' }
    }
  });
}