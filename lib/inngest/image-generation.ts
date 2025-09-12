import { inngest } from "./client";
import { sql } from "@/lib/db";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface ImageGenerationRequest {
  prompt: string;
  brandId?: string;
  size?: string;
  style?: string;
  generateActualImage?: boolean;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Placeholder image üretme fonksiyonu (text-to-image placeholder)
async function generatePlaceholderImage(prompt: string): Promise<string> {
  // Placeholder.com API kullanarak metin bazlı görsel oluştur
  const width = 1024;
  const height = 1024;
  const bgColor = '00E599';
  const textColor = 'ffffff';
  const text = encodeURIComponent(prompt.slice(0, 50));
  
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${text}`;
}

// Cloudinary'ye görsel yükleme
async function uploadToCloudinary(imageUrl: string, prompt: string): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'generated-images',
      public_id: `ai-generated-${Date.now()}`,
      tags: ['ai-generated', 'openrouter'],
      context: {
        prompt: prompt.slice(0, 200),
        generated_at: new Date().toISOString()
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

// OpenRouter API ile resim prompt'u geliştirme fonksiyonu
async function generateImageWithOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai.gul-tekinmuhendislik.com",
        "X-Title": "Gül-Tekin Mühendislik AI"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Create a detailed image generation prompt for: ${prompt}. 
                Make it descriptive, artistic, and suitable for DALL-E or similar AI image generators.
                Focus on visual details, style, lighting, and composition.
                Keep it under 200 words.`
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from OpenRouter API");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating image prompt:", error);
    throw error;
  }
}

// Inngest fonksiyonu - Resim üretme
export const generateImage = inngest.createFunction(
  { 
    id: "generate-image",
    name: "Generate Image with OpenRouter"
  },
  { event: "image/generate.requested" },
  async ({ event, step }) => {
    const { prompt, brandId, size = "1024x1024", style = "realistic", generateActualImage = true } = event.data as ImageGenerationRequest;

    // Step 1: OpenRouter ile geliştirilmiş prompt oluştur
    const enhancedPrompt = await step.run("enhance-prompt", async () => {
      return await generateImageWithOpenRouter(prompt);
    });

    // Step 2: Placeholder görsel oluştur
    const placeholderUrl = await step.run("generate-placeholder", async () => {
      if (generateActualImage) {
        return await generatePlaceholderImage(enhancedPrompt);
      }
      return null;
    });

    // Step 3: Cloudinary'ye yükle
    const cloudinaryResult = await step.run("upload-to-cloudinary", async () => {
      if (placeholderUrl) {
        try {
          return await uploadToCloudinary(placeholderUrl, enhancedPrompt);
        } catch (error) {
          console.error('Cloudinary upload failed:', error);
          return null;
        }
      }
      return null;
    });

    // Step 4: Üretilen prompt'u ve görsel bilgilerini veritabanına kaydet
    const savedImage = await step.run("save-to-database", async () => {
      const result = await sql`
        INSERT INTO generated_images (
          original_prompt,
          enhanced_prompt,
          brand_id,
          size,
          style,
          status,
          cloudinary_url,
          cloudinary_public_id,
          created_at
        ) VALUES (
          ${prompt},
          ${enhancedPrompt},
          ${brandId || null},
          ${size},
          ${style},
          ${cloudinaryResult ? 'completed' : 'prompt_only'},
          ${cloudinaryResult?.url || null},
          ${cloudinaryResult?.publicId || null},
          ${new Date().toISOString()}
        )
        RETURNING id, original_prompt, enhanced_prompt, cloudinary_url, created_at
      `;
      
      return result[0];
    });

    // Step 5: Event log kaydet
    await step.run("log-event", async () => {
      await sql`
        INSERT INTO event_logs (
          event_name,
          event_type,
          status,
          payload,
          metadata
        ) VALUES (
          'image.generation.completed',
          'ai_generation',
          'success',
          ${JSON.stringify({
            imageId: savedImage.id,
            originalPrompt: prompt,
            enhancedPrompt: enhancedPrompt,
            cloudinaryUrl: cloudinaryResult?.url || null
          })},
          ${JSON.stringify({
            brandId,
            size,
            style,
            model: 'google/gemini-2.0-flash-exp',
            hasImage: !!cloudinaryResult
          })}
        )
      `;
    });

    return {
      success: true,
      imageId: savedImage.id,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      imageUrl: cloudinaryResult?.url || null,
      message: cloudinaryResult 
        ? "Image generated and uploaded successfully" 
        : "Image prompt generated successfully"
    };
  }
);

// Toplu resim üretme fonksiyonu
export const generateBulkImages = inngest.createFunction(
  { 
    id: "generate-bulk-images",
    name: "Generate Multiple Images"
  },
  { event: "image/bulk-generate.requested" },
  async ({ event, step }) => {
    const { prompts } = event.data as { prompts: string[] };
    
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const result = await step.run(`generate-image-${i}`, async () => {
        await inngest.send({
          name: "image/generate.requested",
          data: {
            prompt: prompts[i]
          }
        });
        
        return {
          prompt: prompts[i],
          status: "queued"
        };
      });
      
      results.push(result);
    }
    
    return {
      success: true,
      totalQueued: results.length,
      results
    };
  }
);