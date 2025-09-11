import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import { sql } from "@/lib/db";
import fs from 'fs/promises';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface PromptItem {
  id: number;
  prompt: string;
  model: string;
  generate: boolean;
}

interface TestPrompts {
  prompts: PromptItem[];
  settings: {
    autoGenerate: boolean;
    uploadToCloudinary: boolean;
    imageSize: string;
    numImages: number;
  };
  lastModified: string;
}

// Direct Fal.ai API çağrısı
async function generateWithFalAIDirect(prompt: string, model: string = "fal-ai/flux/schnell") {
  const apiKey = process.env.FAL_AI_KEY;
  if (!apiKey) {
    throw new Error("FAL_AI_KEY not set");
  }

  // Model ismi imagen4-fast ise doğru formata çevir
  const falModel = model === "imagen4-fast" ? "fal-ai/flux/schnell" : model;

  console.log(`Generating image with Fal.ai: ${falModel}`);
  console.log(`Prompt: ${prompt}`);

  const response = await fetch(`https://fal.run/${falModel}`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      image_size: "landscape_16_9",
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Fal.ai error: ${response.status} - ${error}`);
  }

  return await response.json();
}

// Cloudinary'ye yükle
async function uploadToCloudinary(imageUrl: string, prompt: string) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'test-generated',
      public_id: `test-${Date.now()}`,
      tags: ['test', 'fal-ai', 'local'],
      context: {
        prompt: prompt.slice(0, 200),
        generated_at: new Date().toISOString()
      }
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

export async function POST() {
  try {
    // JSON dosyasını oku
    const jsonPath = path.join(process.cwd(), 'test-prompts.json');
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const data: TestPrompts = JSON.parse(jsonContent);

    const results = [];

    // generate: true olan promptları işle
    for (const item of data.prompts) {
      if (!item.generate) {
        console.log(`Skipping prompt ${item.id}: generate=false`);
        continue;
      }

      console.log(`Processing prompt ${item.id}: ${item.prompt}`);

      try {
        // 1. Fal.ai ile resim üret
        const falResponse = await generateWithFalAIDirect(item.prompt, item.model);
        console.log(`Generated ${falResponse.images?.length || 0} images`);

        // 2. Cloudinary'ye yükle
        const uploadResults = [];
        if (data.settings.uploadToCloudinary && falResponse.images) {
          for (const image of falResponse.images) {
            const cloudinaryResult = await uploadToCloudinary(image.url, item.prompt);
            uploadResults.push(cloudinaryResult);
            console.log(`Uploaded to Cloudinary: ${cloudinaryResult.publicId}`);
          }
        }

        // 3. Veritabanına kaydet
        for (let i = 0; i < uploadResults.length; i++) {
          const dbResult = await sql`
            INSERT INTO generated_images (
              original_prompt,
              enhanced_prompt,
              size,
              style,
              status,
              cloudinary_url,
              cloudinary_public_id,
              metadata,
              created_at
            ) VALUES (
              ${item.prompt},
              ${item.prompt},
              ${`${falResponse.images[i].width}x${falResponse.images[i].height}`},
              ${item.model},
              'completed',
              ${uploadResults[i].url},
              ${uploadResults[i].publicId},
              ${JSON.stringify({
                model: item.model,
                fal_ai_url: falResponse.images[i].url,
                test_run: true,
                prompt_id: item.id
              })},
              ${new Date().toISOString()}
            )
            RETURNING id
          `;
          console.log(`Saved to database: ${dbResult[0].id}`);
        }

        results.push({
          promptId: item.id,
          success: true,
          images: uploadResults.length,
          cloudinaryUrls: uploadResults.map(r => r.url)
        });

      } catch (error) {
        console.error(`Error processing prompt ${item.id}:`, error);
        results.push({
          promptId: item.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      message: `Processed ${results.length} prompts`
    });

  } catch (error) {
    console.error("Error processing prompts:", error);
    return NextResponse.json(
      { 
        error: "Failed to process prompts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // JSON dosyasını oku ve göster
    const jsonPath = path.join(process.cwd(), 'test-prompts.json');
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const data: TestPrompts = JSON.parse(jsonContent);

    const toGenerate = data.prompts.filter(p => p.generate).length;

    return NextResponse.json({
      message: "Test Prompts Status",
      totalPrompts: data.prompts.length,
      toGenerate,
      settings: data.settings,
      prompts: data.prompts,
      usage: {
        "GET /api/process-prompts": "View current prompts",
        "POST /api/process-prompts": "Process prompts with generate=true",
        "Edit test-prompts.json": "Change prompts and set generate=true to process"
      }
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to read prompts file" },
      { status: 500 }
    );
  }
}