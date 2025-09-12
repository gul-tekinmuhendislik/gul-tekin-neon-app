import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function generateWithFalAI(prompt: string) {
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
        prompt,
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
    console.error("Error generating image with Fal.ai:", error);
    throw error;
  }
}

async function uploadToCloudinary(imageUrl: string, prompt: string) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'fal-ai-generated',
      public_id: `fal-ai-${Date.now()}`,
      tags: ['ai-generated', 'fal-ai'],
      context: {
        prompt: prompt.slice(0, 200),
        generated_at: new Date().toISOString(),
        ai_model: 'fal-ai'
      },
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export async function POST() {
  try {
    console.log('🔄 Regenerating all blog images with text-free prompts...');

    // Get all blogs
    const blogs = await sql`
      SELECT id, title, topic
      FROM generated_content
      WHERE status = 'completed' OR status = 'published'
      ORDER BY id ASC
    `;

    console.log(`📊 Found ${blogs.length} blogs to regenerate`);

    const results = [];

    for (const blog of blogs) {
      let prompt = '';
      
      // Generate text-free prompts based on topic
      switch (blog.topic) {
        case 'Su Arıtma Sistemleri':
          prompt = 'modern water filtration equipment, blue clean water, industrial purification system, stainless steel filters, no text, photorealistic';
          break;
        case 'Sulama Sistemleri':
          prompt = 'green agricultural irrigation, sprinkler systems in action, water droplets on plants, modern farming equipment, no text, photorealistic';
          break;
        case 'Isı Pompası Sistemleri':
          prompt = 'modern heat pump unit, HVAC equipment, energy efficient system, outdoor unit with fan, no text, photorealistic';
          break;
        case 'Su Depoları ve Hidrofor Sistemleri':
          prompt = 'large blue water storage tanks, pressure pump system, industrial water facility, stainless steel equipment, no text, photorealistic';
          break;
        default:
          prompt = 'modern engineering equipment, blue and steel colors, industrial facility, professional machinery, no text, photorealistic';
      }

      try {
        console.log(`🎨 Generating image for blog ${blog.id}: ${blog.title}`);
        
        // Generate image
        const falResponse = await generateWithFalAI(prompt);
        
        if (!falResponse.images || falResponse.images.length === 0) {
          throw new Error('No image generated');
        }

        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(
          falResponse.images[0].url,
          `Blog: ${blog.title} - ${prompt}`
        );

        // Update blog record
        await sql`
          UPDATE generated_content
          SET 
            image_url = ${cloudinaryResult.url},
            image_prompt = ${prompt},
            updated_at = ${new Date().toISOString()}
          WHERE id = ${blog.id}
        `;

        results.push({
          id: blog.id,
          title: blog.title,
          status: 'success',
          imageUrl: cloudinaryResult.url,
          prompt: prompt
        });

        console.log(`✅ Blog ${blog.id} completed`);
        
        // Wait between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error processing blog ${blog.id}:`, error);
        results.push({
          id: blog.id,
          title: blog.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`🎉 Regeneration complete! ${successCount} success, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      message: `Regenerated ${successCount} images out of ${blogs.length} blogs`,
      results,
      stats: {
        total: blogs.length,
        success: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('❌ Error regenerating images:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to regenerate images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}