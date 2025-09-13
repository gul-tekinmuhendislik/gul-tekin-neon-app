import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from 'cloudinary';
import { sql } from "@/lib/db";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Gemini ile prompt optimizasyonu + Fal.ai ile resim üretimi
export const generateImageWithGeminiPrompt = inngest.createFunction(
  {
    id: "generate-image-with-gemini-prompt",
    name: "Generate Image with Gemini-Optimized Prompt",
  },
  { event: "image.generate.gemini" },
  async ({ event, step }) => {
    const { basePrompt, style = "photorealistic", brandId, contentId, contentType } = event.data;

    // Step 1: Gemini ile prompt optimizasyonu
    const optimizedPrompt = await step.run("optimize-prompt-with-gemini", async () => {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GOOGLE_GEMINI_API_KEY is not set");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const promptOptimizationRequest = `
        Aşağıdaki temel prompt'u, yüksek kaliteli görsel üretimi için optimize et.

        Temel Prompt: ${basePrompt}
        Stil: ${style}

        Gereksinimler:
        1. Detaylı görsel tanımlamalar ekle
        2. Kompozisyon, ışıklandırma, renk paleti belirt
        3. Profesyonel ve etkileyici olmalı
        4. Mühendislik/teknoloji teması korunmalı
        5. İngilizce olarak yaz
        6. Maksimum 200 kelime

        Sadece optimize edilmiş prompt'u döndür, başka açıklama ekleme.
      `;

      const result = await model.generateContent(promptOptimizationRequest);
      const response = await result.response;
      const optimizedPrompt = response.text().trim();

      console.log("Original prompt:", basePrompt);
      console.log("Optimized prompt:", optimizedPrompt);

      return optimizedPrompt;
    });

    // Step 2: Fal.ai ile resim üretimi
    const generatedImage = await step.run("generate-with-fal-ai", async () => {
      const apiKey = process.env.FAL_AI_KEY;
      if (!apiKey) {
        throw new Error("FAL_AI_KEY is not set");
      }

      const response = await fetch("https://fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          "Authorization": `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: optimizedPrompt,
          image_size: "landscape_16_9",
          num_inference_steps: 4,
          num_images: 1,
          enable_safety_checker: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Fal.ai API error: ${error}`);
      }

      const data = await response.json();
      return data.images[0];
    });

    // Step 3: Cloudinary'ye yükle
    const cloudinaryResult = await step.run("upload-to-cloudinary", async () => {
      const uploadResult = await cloudinary.uploader.upload(generatedImage.url, {
        folder: `ai-generated/${contentType || 'general'}`,
        public_id: `gemini-${Date.now()}`,
        tags: ["ai-generated", "gemini-optimized", contentType || "general"],
        context: {
          original_prompt: basePrompt,
          optimized_prompt: optimizedPrompt,
          model: "fal-ai-flux-schnell",
          style: style,
        },
      });

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      };
    });

    // Step 4: Veritabanına kaydet
    await step.run("save-to-database", async () => {
      if (contentId && contentType) {
        await sql`
          INSERT INTO generated_images (
            content_id,
            content_type,
            original_prompt,
            optimized_prompt,
            image_url,
            cloudinary_public_id,
            model,
            style,
            metadata,
            created_at
          ) VALUES (
            ${contentId},
            ${contentType},
            ${basePrompt},
            ${optimizedPrompt},
            ${cloudinaryResult.url},
            ${cloudinaryResult.publicId},
            'gemini-fal-hybrid',
            ${style},
            ${JSON.stringify({
              width: cloudinaryResult.width,
              height: cloudinaryResult.height,
              format: cloudinaryResult.format,
              brandId: brandId,
            })},
            NOW()
          )
        `;
      }
    });

    return {
      success: true,
      data: {
        originalPrompt: basePrompt,
        optimizedPrompt: optimizedPrompt,
        imageUrl: cloudinaryResult.url,
        cloudinaryPublicId: cloudinaryResult.publicId,
        metadata: {
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          style: style,
        },
      },
    };
  }
);

// Gemini ile toplu resim üretimi
export const batchGenerateWithGemini = inngest.createFunction(
  {
    id: "batch-generate-with-gemini",
    name: "Batch Generate Images with Gemini",
    concurrency: {
      limit: 3, // Aynı anda maksimum 3 görsel üretimi
    },
  },
  { event: "image.batch.generate.gemini" },
  async ({ event, step }) => {
    const { prompts, style = "photorealistic", brandId } = event.data;

    const results = [];

    for (let i = 0; i < prompts.length; i++) {
      const result = await step.run(`generate-image-${i}`, async () => {
        // Her bir prompt için image.generate.gemini event'i tetikle
        const { ids } = await inngest.send({
          name: "image.generate.gemini",
          data: {
            basePrompt: prompts[i],
            style: style,
            brandId: brandId,
            contentType: "batch",
          },
        });

        return {
          prompt: prompts[i],
          eventId: ids[0],
        };
      });

      results.push(result);
    }

    return {
      success: true,
      totalImages: prompts.length,
      results: results,
    };
  }
);

// Gemini ile içerik analizi ve görsel önerisi
export const suggestImageWithGemini = inngest.createFunction(
  {
    id: "suggest-image-with-gemini",
    name: "Suggest Image with Gemini Analysis",
  },
  { event: "image.suggest.gemini" },
  async ({ event, step }) => {
    const { content, contentType, keywords } = event.data;

    const suggestion = await step.run("analyze-and-suggest", async () => {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GOOGLE_GEMINI_API_KEY is not set");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const analysisPrompt = `
        Aşağıdaki içerik için en uygun görsel konseptini öner:

        İçerik Tipi: ${contentType}
        Anahtar Kelimeler: ${keywords?.join(", ") || ""}
        İçerik: ${content.substring(0, 1000)}...

        Lütfen şu formatta yanıt ver:

        **Görsel Konsepti:**
        [Ana görsel fikri]

        **Görsel Prompt (İngilizce):**
        [Detaylı görsel üretim prompt'u]

        **Renk Paleti:**
        [Önerilen renkler]

        **Kompozisyon:**
        [Görsel düzenleme önerisi]

        **Stil:**
        [Görsel stil önerisi]
      `;

      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const analysis = response.text();

      // Analiz metninden prompt'u çıkar
      const promptMatch = analysis.match(/\*\*Görsel Prompt \(İngilizce\):\*\*\s*\n([^\n*]+)/);
      const visualPrompt = promptMatch ? promptMatch[1].trim() : "";

      return {
        fullAnalysis: analysis,
        suggestedPrompt: visualPrompt,
        contentType: contentType,
      };
    });

    // Öneriyi otomatik olarak görsel üretimi için kullan
    if (suggestion.suggestedPrompt) {
      await step.run("trigger-image-generation", async () => {
        await inngest.send({
          name: "image.generate.gemini",
          data: {
            basePrompt: suggestion.suggestedPrompt,
            style: "professional",
            contentType: contentType,
          },
        });
      });
    }

    return {
      success: true,
      suggestion: suggestion,
    };
  }
);