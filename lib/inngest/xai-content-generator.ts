import { inngest } from "./client";
import { sql } from "../db";

interface XAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function callXAIAPI(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("XAI_API_KEY is not configured");
  }

  const messages = [];
  
  if (systemPrompt) {
    messages.push({
      role: "system",
      content: systemPrompt
    });
  }
  
  messages.push({
    role: "user",
    content: prompt
  });

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "grok-beta",
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`XAI API error: ${response.status} - ${error}`);
  }

  const data: XAIResponse = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from XAI API");
  }

  return data.choices[0].message.content;
}

export const generateContentWithXAI = inngest.createFunction(
  {
    id: "generate-content-xai",
    name: "Generate Content with XAI",
    retries: 2
  },
  { event: "content/generate.xai" },
  async ({ event, step }) => {
    const { topic, keywords, contentType = "blog" } = event.data;

    // Step 1: Generate title and outline
    const outline = await step.run("generate-outline", async () => {
      const systemPrompt = `Sen uzman bir içerik yazarısın. SEO optimizasyonu ve kullanıcı deneyimi konusunda deneyimlisin. 
      Türkçe içerik üretiyorsun ve Türkiye'deki okuyuculara hitap ediyorsun.`;
      
      const prompt = `"${topic}" konusunda bir ${contentType === "blog" ? "blog yazısı" : "içerik"} için:
      
      1. SEO optimizeli bir başlık oluştur
      2. Ana başlıkları içeren bir taslak hazırla (H2 ve H3 başlıkları)
      3. Anahtar kelimeler: ${keywords ? keywords.join(", ") : topic}
      
      Çıktı formatı:
      Başlık: [başlık]
      
      Taslak:
      - [H2 başlık 1]
        - [H3 alt başlık]
        - [H3 alt başlık]
      - [H2 başlık 2]
        ...`;

      return await callXAIAPI(prompt, systemPrompt);
    });

    // Step 2: Generate full content
    const content = await step.run("generate-full-content", async () => {
      const systemPrompt = `Sen uzman bir içerik yazarısın. SEO optimizasyonu konusunda deneyimlisin.
      İçeriğini Markdown formatında yazacaksın. Doğal ve akıcı bir dil kullan.`;
      
      const prompt = `Aşağıdaki taslağa göre "${topic}" konusunda kapsamlı bir ${contentType === "blog" ? "blog yazısı" : "içerik"} yaz:
      
      ${outline}
      
      Gereksinimler:
      - Minimum 1500 kelime
      - Markdown formatında yaz
      - SEO dostu
      - Okuyucu dostu ve bilgilendirici
      - Anahtar kelimeleri doğal şekilde kullan: ${keywords ? keywords.join(", ") : topic}
      - Giriş ve sonuç bölümleri olsun
      - Örnekler ve açıklamalar içersin`;

      return await callXAIAPI(prompt, systemPrompt);
    });

    // Step 3: Generate meta description
    const metadata = await step.run("generate-metadata", async () => {
      const prompt = `Aşağıdaki içerik için SEO metadata oluştur:
      
      İçerik: ${content.substring(0, 500)}...
      
      Oluşturulacaklar:
      1. Meta başlık (60 karakter)
      2. Meta açıklama (155 karakter)
      3. URL slug (küçük harf, tire ile ayrılmış)
      4. 5-8 anahtar kelime
      
      JSON formatında döndür:
      {
        "metaTitle": "",
        "metaDescription": "",
        "slug": "",
        "keywords": []
      }`;

      const response = await callXAIAPI(prompt);
      
      try {
        return JSON.parse(response);
      } catch {
        // Fallback değerler
        return {
          metaTitle: topic.substring(0, 60),
          metaDescription: content.substring(0, 155),
          slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          keywords: keywords || [topic]
        };
      }
    });

    // Step 4: Save to database
    const saved = await step.run("save-to-database", async () => {
      const result = await sql`
        INSERT INTO generated_content (
          topic,
          title,
          slug,
          content,
          meta_title,
          meta_description,
          keywords,
          status,
          metadata,
          created_at,
          updated_at
        ) VALUES (
          ${topic},
          ${metadata.metaTitle || topic},
          ${metadata.slug},
          ${content},
          ${metadata.metaTitle},
          ${metadata.metaDescription},
          ${metadata.keywords},
          'completed',
          ${JSON.stringify({ 
            generator: 'xai',
            model: 'grok-beta',
            contentType: contentType
          })}::jsonb,
          NOW(),
          NOW()
        )
        RETURNING id, slug
      `;

      return result[0];
    });

    // Step 5: Log event
    await step.run("log-event", async () => {
      await sql`
        INSERT INTO event_logs (name, data)
        VALUES (
          'xai_content_generated',
          ${JSON.stringify({
            contentId: saved.id,
            topic: topic,
            slug: saved.slug,
            contentType: contentType
          })}::jsonb
        )
      `;
    });

    return {
      success: true,
      contentId: saved.id,
      slug: saved.slug,
      message: `Content generated successfully with XAI for topic: ${topic}`
    };
  }
);

export const generateImageWithXAI = inngest.createFunction(
  {
    id: "generate-image-xai",
    name: "Generate Image Description with XAI",
    retries: 2
  },
  { event: "image/generate.xai" },
  async ({ event, step }) => {
    const { contentId, title, topic } = event.data;

    // Step 1: Generate image prompt
    const imagePrompt = await step.run("generate-image-prompt", async () => {
      const prompt = `"${title || topic}" konusu için bir blog yazısının öne çıkan görseli için detaylı bir görsel tarifi (image prompt) oluştur.
      
      Gereksinimler:
      - Profesyonel ve modern görünüm
      - Konuyla ilgili görsel elementler
      - Renk paleti önerileri
      - Kompozisyon detayları
      - Stil önerileri (fotoğraf, illüstrasyon, vb.)
      
      İngilizce olarak, DALL-E veya Midjourney için optimize edilmiş bir prompt oluştur.`;

      return await callXAIAPI(prompt);
    });

    // Step 2: Update content with image prompt
    if (contentId) {
      await step.run("update-content-metadata", async () => {
        await sql`
          UPDATE generated_content
          SET 
            metadata = metadata || ${JSON.stringify({ 
              imagePrompt: imagePrompt,
              imagePromptGeneratedAt: new Date().toISOString()
            })}::jsonb,
            updated_at = NOW()
          WHERE id = ${contentId}
        `;
      });
    }

    return {
      success: true,
      imagePrompt: imagePrompt,
      contentId: contentId,
      message: "Image prompt generated successfully with XAI"
    };
  }
);

export const generatePromptForContent = inngest.createFunction(
  {
    id: "generate-prompt-for-content",
    name: "Generate Image Prompt for Existing Content",
    retries: 2
  },
  { event: "content/generate-prompt.xai" },
  async ({ event, step }) => {
    const { contentId, batchProcess = false } = event.data;

    // Step 1: Fetch content(s) that need prompts
    const contents = await step.run("fetch-contents-without-prompts", async () => {
      if (batchProcess) {
        // Fetch all contents without prompts
        const results = await sql`
          SELECT id, topic, title, content, keywords
          FROM generated_content
          WHERE prompt IS NULL
          LIMIT 10
        `;
        return results;
      } else if (contentId) {
        // Fetch specific content
        const results = await sql`
          SELECT id, topic, title, content, keywords
          FROM generated_content
          WHERE id = ${contentId}
        `;
        return results;
      } else {
        // Fetch one content without prompt
        const results = await sql`
          SELECT id, topic, title, content, keywords
          FROM generated_content
          WHERE prompt IS NULL
          LIMIT 1
        `;
        return results;
      }
    });

    if (contents.length === 0) {
      return {
        success: false,
        message: "No content found that needs prompt generation"
      };
    }

    // Step 2: Generate prompts for each content
    const generatedPrompts = await step.run("generate-prompts", async () => {
      const prompts = [];
      
      for (const content of contents) {
        const systemPrompt = `You are an expert at creating image generation prompts for blog headers. 
        Create prompts for modern editorial vector art illustrations, not photorealistic images.
        Focus on abstract, conceptual representations suitable for professional blog headers.`;
        
        const userPrompt = `Create a detailed image generation prompt for a blog header illustration based on this content:

        Title: ${content.title}
        Topic: ${content.topic}
        Keywords: ${content.keywords ? content.keywords.join(', ') : content.topic}
        Content excerpt: ${content.content.substring(0, 500)}

        Requirements:
        - 16:9 aspect ratio blog header illustration
        - Modern editorial vector art style
        - Abstract/conceptual representation (NOT photorealistic)
        - Professional digital illustration quality
        - Geometric patterns and organic flow combination
        - NO text or typography in the image
        - Color palette should match the topic theme
        - Suitable for web display as blog hero banner

        The prompt should be in English, optimized for AI image generation, and focus on visual elements that represent the topic conceptually.`;

        const generatedPrompt = await callXAIAPI(userPrompt, systemPrompt);
        
        prompts.push({
          contentId: content.id,
          prompt: generatedPrompt.trim()
        });
      }
      
      return prompts;
    });

    // Step 3: Update database with generated prompts
    const updated = await step.run("update-prompts-in-database", async () => {
      const results = [];
      
      for (const item of generatedPrompts) {
        await sql`
          UPDATE generated_content
          SET 
            prompt = ${item.prompt},
            metadata = metadata || ${JSON.stringify({ 
              promptGeneratedAt: new Date().toISOString(),
              promptGenerator: 'xai'
            })}::jsonb,
            updated_at = NOW()
          WHERE id = ${item.contentId}
        `;
        
        results.push({
          contentId: item.contentId,
          success: true
        });
      }
      
      return results;
    });

    // Step 4: Log event
    await step.run("log-prompt-generation", async () => {
      await sql`
        INSERT INTO event_logs (name, data)
        VALUES (
          'xai_prompt_generated',
          ${JSON.stringify({
            count: updated.length,
            contentIds: updated.map(u => u.contentId),
            batchProcess: batchProcess
          })}::jsonb
        )
      `;
    });

    return {
      success: true,
      promptsGenerated: updated.length,
      contentIds: updated.map(u => u.contentId),
      message: `Successfully generated ${updated.length} prompt(s)`
    };
  }
);

export const enhanceContentWithXAI = inngest.createFunction(
  {
    id: "enhance-content-xai",
    name: "Enhance Existing Content with XAI",
    retries: 2
  },
  { event: "content/enhance.xai" },
  async ({ event, step }) => {
    const { contentId, enhancementType = "improve" } = event.data;

    // Step 1: Fetch existing content
    const existingContent = await step.run("fetch-content", async () => {
      const result = await sql`
        SELECT id, topic, title, content, keywords
        FROM generated_content
        WHERE id = ${contentId}
      `;
      
      if (result.length === 0) {
        throw new Error(`Content not found with ID: ${contentId}`);
      }
      
      return result[0];
    });

    // Step 2: Enhance content based on type
    const enhancedContent = await step.run("enhance-content", async () => {
      let prompt = "";
      
      switch (enhancementType) {
        case "improve":
          prompt = `Aşağıdaki içeriği geliştir ve zenginleştir:
          
          Başlık: ${existingContent.title}
          İçerik: ${existingContent.content}
          
          Geliştirmeler:
          - Daha fazla detay ve örnek ekle
          - SEO optimizasyonunu artır
          - Okunabilirliği iyileştir
          - Güncel bilgiler ekle
          - Markdown formatını koru`;
          break;
          
        case "summarize":
          prompt = `Aşağıdaki içeriğin özetini oluştur:
          
          ${existingContent.content}
          
          - 200-300 kelimelik özet
          - Ana noktaları vurgula
          - Markdown formatında`;
          break;
          
        case "social":
          prompt = `Aşağıdaki blog içeriği için sosyal medya paylaşımları oluştur:
          
          Başlık: ${existingContent.title}
          İçerik özeti: ${existingContent.content.substring(0, 500)}
          
          Oluştur:
          1. Twitter/X için 3 farklı tweet (280 karakter)
          2. LinkedIn için profesyonel bir paylaşım
          3. Facebook için kısa bir açıklama
          4. Instagram için caption ve hashtag önerileri
          
          JSON formatında döndür`;
          break;
          
        default:
          throw new Error(`Unknown enhancement type: ${enhancementType}`);
      }

      return await callXAIAPI(prompt);
    });

    // Step 3: Save enhanced content
    const saved = await step.run("save-enhancement", async () => {
      if (enhancementType === "improve") {
        // Update the original content
        await sql`
          UPDATE generated_content
          SET 
            content = ${enhancedContent},
            metadata = metadata || ${JSON.stringify({ 
              enhancedAt: new Date().toISOString(),
              enhancementType: enhancementType,
              enhancedBy: 'xai'
            })}::jsonb,
            updated_at = NOW()
          WHERE id = ${contentId}
        `;
      } else {
        // Store enhancement in metadata
        await sql`
          UPDATE generated_content
          SET 
            metadata = metadata || ${JSON.stringify({ 
              enhancements: {
                [enhancementType]: enhancedContent,
                generatedAt: new Date().toISOString()
              }
            })}::jsonb,
            updated_at = NOW()
          WHERE id = ${contentId}
        `;
      }
      
      return { contentId, enhancementType };
    });

    return {
      success: true,
      ...saved,
      message: `Content enhanced successfully with XAI (${enhancementType})`
    };
  }
);