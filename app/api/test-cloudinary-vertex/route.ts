import { NextResponse } from "next/server";
import { uploadToCloudinary, getResponsiveImageUrls } from "@/lib/cloudinary";
import { sql } from "@/lib/db";

// Test Cloudinary upload with a sample image
export async function GET() {
  try {
    // Use a sample image URL for testing
    const sampleImageUrl = "https://picsum.photos/1920/1080";

    // Upload to Cloudinary
    const timestamp = Date.now();
    const publicId = `vertex-ai-test/${timestamp}`;

    const uploadResult = await uploadToCloudinary(sampleImageUrl, {
      folder: 'vertex-ai-test',
      public_id: publicId,
      resource_type: 'image',
      format: 'jpg',
      quality: 'auto:best',
      tags: ['vertex-ai-test', 'test-upload', 'generated']
    });

    if (!uploadResult.success || !uploadResult.data) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Generate responsive URLs
    const responsiveUrls = getResponsiveImageUrls(
      uploadResult.data.public_id,
      [320, 640, 768, 1024, 1280, 1920],
      {
        quality: 'auto:best',
        fetch_format: 'auto'
      }
    );

    // Save to database (optional)
    const dbResult = await sql`
      INSERT INTO vertex_images (
        prompt,
        enhanced_prompt,
        image_url,
        cloudinary_public_id,
        model,
        provider,
        aspect_ratio,
        metadata,
        status
      ) VALUES (
        'Test Cloudinary upload from Vertex AI simulation',
        'Testing Cloudinary integration with responsive URLs',
        ${uploadResult.data.url},
        ${uploadResult.data.public_id},
        'test-model',
        'cloudinary-test',
        '16:9',
        ${JSON.stringify({
          test: true,
          responsiveUrls,
          width: uploadResult.data.width,
          height: uploadResult.data.height,
          uploadedAt: new Date().toISOString()
        })},
        'completed'
      )
      RETURNING id, image_url, cloudinary_public_id
    `;

    return NextResponse.json({
      success: true,
      message: "Cloudinary upload test successful",
      cloudinary: {
        url: uploadResult.data.url,
        publicId: uploadResult.data.public_id,
        width: uploadResult.data.width,
        height: uploadResult.data.height,
        format: uploadResult.data.format,
        bytes: uploadResult.data.bytes,
        tags: uploadResult.data.tags
      },
      responsiveUrls,
      database: {
        id: dbResult[0].id,
        savedUrl: dbResult[0].image_url
      }
    });
  } catch (error) {
    console.error("Cloudinary test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Test with custom image data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl = "https://picsum.photos/1920/1080", prompt = "Test image" } = body;

    // Upload to Cloudinary
    const timestamp = Date.now();
    const publicId = `vertex-ai-manual/${timestamp}`;

    const uploadResult = await uploadToCloudinary(imageUrl, {
      folder: 'vertex-ai-manual',
      public_id: publicId,
      resource_type: 'image',
      quality: 'auto:best',
      tags: ['vertex-ai', 'manual-test', 'cloudinary']
    });

    if (!uploadResult.success || !uploadResult.data) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Generate responsive URLs
    const responsiveUrls = getResponsiveImageUrls(
      uploadResult.data.public_id,
      [320, 640, 768, 1024, 1280, 1920],
      {
        quality: 'auto:best',
        fetch_format: 'auto'
      }
    );

    return NextResponse.json({
      success: true,
      message: "Image uploaded to Cloudinary",
      prompt,
      cloudinary: {
        url: uploadResult.data.url,
        publicId: uploadResult.data.public_id,
        width: uploadResult.data.width,
        height: uploadResult.data.height,
        format: uploadResult.data.format
      },
      responsiveUrls,
      viewUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${uploadResult.data.public_id}`
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}