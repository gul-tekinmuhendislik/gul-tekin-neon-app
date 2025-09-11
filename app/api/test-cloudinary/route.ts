import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST() {
  try {
    console.log('🧪 Testing direct Cloudinary upload...');
    
    // Test image from Unsplash
    const testImageUrl = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300";
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(testImageUrl, {
      folder: "test-uploads",
      public_id: "direct-test-" + Date.now(),
      tags: ["test", "direct", "api"],
      quality: "auto:good",
      width: 400,
      height: 300,
      crop: "fill"
    });
    
    console.log('✅ Cloudinary upload successful:', result);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Upload failed');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Direct Cloudinary upload test successful',
      result: {
        url: result.data.url,
        public_id: result.data.public_id,
        width: result.data.width,
        height: result.data.height,
        format: result.data.format,
        bytes: result.data.bytes
      }
    });
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Direct Cloudinary upload test failed'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Direct Cloudinary upload test endpoint',
    usage: 'POST to test direct Cloudinary upload functionality'
  });
}