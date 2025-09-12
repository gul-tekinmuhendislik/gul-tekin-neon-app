import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testFalAI() {
  const apiKey = process.env.FAL_AI_KEY;
  if (!apiKey) {
    throw new Error("FAL_AI_KEY environment variable is not set");
  }

  try {
    const apiUrl = `https://fal.run/fal-ai/imagen4/preview/fast`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: "Water tank test",
        image_size: "landscape_16_9",
        num_inference_steps: 4,
        guidance_scale: 7.5,
        num_images: 1,
        enable_safety_checker: true,
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Fal.ai API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error testing Fal.ai:", error);
    throw error;
  }
}

async function testCloudinary(imageUrl: string) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'test-upload',
      public_id: `test-${Date.now()}`,
      tags: ['test']
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error testing Cloudinary:', error);
    throw error;
  }
}

export async function POST() {
  try {
    console.log('🧪 Testing Fal.ai API...');
    const falResponse = await testFalAI();
    console.log('✅ Fal.ai Response:', falResponse);

    if (falResponse.images && falResponse.images.length > 0) {
      console.log('🧪 Testing Cloudinary upload...');
      const uploadResult = await testCloudinary(falResponse.images[0].url);
      console.log('✅ Cloudinary Upload:', uploadResult);

      return NextResponse.json({
        success: true,
        falResponse,
        uploadResult,
        message: 'Both Fal.ai and Cloudinary tests passed!'
      });
    }

    return NextResponse.json({
      success: true,
      falResponse,
      message: 'Fal.ai test passed, but no images generated'
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
}