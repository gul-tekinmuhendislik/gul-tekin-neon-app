import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function GET() {
  try {
    // Fetch images from the factory tour folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'factory-tour', // This is the folder name in Cloudinary
      max_results: 100,
      resource_type: 'image'
    });

    const images = result.resources.map((resource: any) => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      createdAt: resource.created_at,
      // Generate optimized thumbnail
      thumbnailUrl: cloudinary.url(resource.public_id, {
        transformation: [
          { width: 400, height: 300, crop: 'fill', quality: 'auto:good' }
        ],
        secure: true
      }),
      // Generate full-size optimized image
      fullUrl: cloudinary.url(resource.public_id, {
        transformation: [
          { width: 1920, quality: 'auto:best', fetch_format: 'auto' }
        ],
        secure: true
      })
    }));

    return NextResponse.json({
      success: true,
      images,
      total: images.length
    });

  } catch (error) {
    console.error('Error fetching factory tour images:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch images'
      },
      { status: 500 }
    );
  }
}
