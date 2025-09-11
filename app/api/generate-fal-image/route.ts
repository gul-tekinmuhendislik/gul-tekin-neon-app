import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

// Fal.ai modelleri listesi
const FAL_AI_MODELS = {
  "imagen4-fast": "fal-ai/imagen4/preview/fast", // Varsayılan - uygun fiyatlı
  "flux-schnell": "fal-ai/flux/schnell",
  "flux-dev": "fal-ai/flux/dev", 
  "flux-pro": "fal-ai/flux-pro",
  "stable-diffusion-xl": "fal-ai/fast-sdxl",
  "stable-diffusion-3": "fal-ai/stable-diffusion-v3-medium",
  "lightning-sdxl": "fal-ai/fast-lightning-sdxl",
  "hyper-sdxl": "fal-ai/hyper-sdxl",
  "stable-cascade": "fal-ai/stable-cascade"
};

const IMAGE_SIZES = {
  "square": "square",
  "square_hd": "square_hd",
  "portrait_4_3": "portrait_4_3",
  "portrait_16_9": "portrait_16_9",
  "landscape_4_3": "landscape_4_3",
  "landscape_16_9": "landscape_16_9"
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      brandId, 
      model = "imagen4-fast", // Varsayılan olarak uygun fiyatlı Imagen4 kullan
      imageSize = "landscape_16_9",
      numInferenceSteps = 4,
      guidanceScale = 7.5,
      numImages = 1,
      enableSafetyChecker = true
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Model adını Fal.ai formatına çevir
    const falModel = FAL_AI_MODELS[model as keyof typeof FAL_AI_MODELS] || FAL_AI_MODELS["imagen4-fast"];

    // Trigger Inngest function
    const event = await inngest.send({
      name: "image/fal-ai.generate.requested",
      data: {
        prompt,
        brandId,
        model: falModel,
        imageSize: IMAGE_SIZES[imageSize as keyof typeof IMAGE_SIZES] || imageSize,
        numInferenceSteps,
        guidanceScale,
        numImages,
        enableSafetyChecker
      }
    });

    return NextResponse.json({
      success: true,
      message: "Fal.ai image generation started",
      eventId: event.ids?.[0],
      data: {
        prompt,
        brandId,
        model: falModel,
        imageSize,
        numInferenceSteps,
        guidanceScale,
        numImages
      }
    });
  } catch (error) {
    console.error("Error triggering Fal.ai image generation:", error);
    return NextResponse.json(
      { 
        error: "Failed to start image generation",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Fal.ai Image Generation API",
    endpoints: {
      "POST /api/generate-fal-image": {
        description: "Generate images using Fal.ai models",
        body: {
          prompt: "Required - The prompt for image generation",
          brandId: "Optional - Brand ID to associate with the image",
          model: "Optional - Model to use (default: flux-schnell)",
          imageSize: "Optional - Image size preset (default: landscape_16_9)",
          numInferenceSteps: "Optional - Number of inference steps (default: 4)",
          guidanceScale: "Optional - Guidance scale for generation (default: 7.5)",
          numImages: "Optional - Number of images to generate (default: 1)",
          enableSafetyChecker: "Optional - Enable safety checker (default: true)"
        },
        availableModels: Object.keys(FAL_AI_MODELS),
        availableSizes: Object.keys(IMAGE_SIZES),
        example: {
          prompt: "A modern heat pump system in a luxury Bodrum villa with sea view, photorealistic, 8k quality",
          model: "imagen4-fast",
          imageSize: "landscape_16_9",
          numInferenceSteps: 4,
          guidanceScale: 7.5,
          numImages: 1
        }
      }
    },
    models: FAL_AI_MODELS,
    imageSizes: IMAGE_SIZES
  });
}