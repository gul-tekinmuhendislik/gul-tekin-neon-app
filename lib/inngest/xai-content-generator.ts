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

// Advanced prompt generator with negative prompts and composition rules
interface PromptResult {
  prompt: string;
  negativePrompt: string;
  parameters: {
    width: number;
    height: number;
    quality: string;
    stylePreset: string;
    cfgScale: number;
    steps: number;
  };
}

interface ContentData {
  id?: number;
  topic: string;
  title?: string;
  content?: string;
  keywords?: string[];
}

function createAdvancedPrompt(content: ContentData): PromptResult {
  // Topic translations (Turkish -> English)
  const topicTranslations: Record<string, string> = {
    "Su Arıtma Sistemleri": "water purification systems",
    "Isı Pompası": "heat pump systems",
    "Güneş Paneli": "solar panel systems",
    "Klima Sistemleri": "air conditioning systems",
    "Yerden Isıtma": "underfloor heating systems",
    "Hidrofor": "water booster systems",
    "Neon Tabela": "neon signage systems",
    "LED Tabela": "LED display systems"
  };

  // Visual elements by topic
  const visualElements: Record<string, Record<string, string>> = {
    "water purification": {
      concrete: "transparent filtration chambers with visible sediment layers, reverse osmosis membrane cross-section, water molecules transforming from dark to crystal clear",
      abstract: "flowing water ribbons through geometric filter shapes, droplet particles becoming diamonds",
      technical: "5-stage filter array (sediment→GAC→CTO→membrane→carbon), pressure gauges, flow indicators"
    },
    "heat pump": {
      concrete: "copper coil spirals with frost and heat zones, compressor unit cutaway, refrigerant flow paths",
      abstract: "temperature gradient waves, hot/cold particle streams, infinity loop energy cycle",
      technical: "evaporator-compressor-condenser cycle diagram, COP efficiency visualization"
    },
    "solar panel": {
      concrete: "photovoltaic cell grid with sunlight rays, silicon wafers, inverter box with LED indicators",
      abstract: "sun rays morphing into electrical circuits, energy particles flowing through panel matrix",
      technical: "monocrystalline cell structure, DC to AC conversion flow, efficiency percentage meter"
    },
    "neon signage": {
      concrete: "glowing neon tubes in various shapes, transformer units, mounting brackets",
      abstract: "luminous gas particles flowing through glass tubes, electric arc visualization",
      technical: "high voltage transformer diagram, gas-filled tube cross-section, electrode connections"
    },
    "default": {
      concrete: "technical system components in exploded view, control panels with indicators",
      abstract: "flowing energy patterns, geometric technical shapes",
      technical: "system flow diagram, efficiency metrics, component connections"
    }
  };

  // Color schemes with hex codes
  const colorSchemes: Record<string, Record<string, string>> = {
    "water purification": {
      primary: "#0EA5E9 to #E0F2FE",
      accent: "#10B981",
      emotion: "evoking clarity, purity, and technological precision"
    },
    "heat pump": {
      primary: "#F97316 to #0284C7",
      accent: "#94A3B8",
      emotion: "representing thermal dynamics and energy efficiency"
    },
    "solar panel": {
      primary: "#FCD34D to #3B82F6",
      accent: "#1E293B",
      emotion: "conveying sustainable energy and innovation"
    },
    "neon signage": {
      primary: "#F472B6 to #8B5CF6",
      accent: "#0F172A",
      emotion: "vibrant illumination and urban energy"
    },
    "default": {
      primary: "#3B82F6 to #1E40AF",
      accent: "#64748B",
      emotion: "professional technology and reliability"
    }
  };

  // Composition rules
  const composition = {
    layout: "asymmetrical balance with 60/40 visual weight distribution",
    focal: "primary element positioned at golden ratio intersection (left third)",
    spacing: "30% negative space on right side for headline placement",
    depth: "3-layer depth: background gradient, main illustration, foreground accents",
    margins: "safe area 10% from edges for responsive cropping"
  };

  // Regional elements
  const regionalElements: Record<string, string> = {
    bodrum: "subtle Mediterranean villa silhouettes, turquoise sea gradient hints, white cubic architecture outlines",
    milas: "olive branch patterns in background, terracotta color accents",
    coastal: "wave patterns as decorative elements, seagull silhouettes in distance"
  };

  // Determine topic
  const topicEng = topicTranslations[content.topic] || content.topic;
  const topicKey = topicEng.toLowerCase().replace(" systems", "").replace(" ", "_");

  // Select visual elements
  const visuals = visualElements[topicKey] || visualElements.default;
  const colors = colorSchemes[topicKey] || colorSchemes.default;

  // Check for regional keywords
  const keywords = content.keywords || [];
  const hasBodrum = keywords.some((kw: string) => kw.toLowerCase().includes("bodrum"));
  const hasMilas = keywords.some((kw: string) => kw.toLowerCase().includes("milas"));
  const regional = hasBodrum ? regionalElements.bodrum : hasMilas ? regionalElements.milas : "";

  // Build main prompt
  const mainPrompt = `
    ${topicEng} hero banner illustration for technical blog,
    16:9 aspect ratio (1920x1080), web-optimized with high contrast,
    
    VISUAL ELEMENTS:
    ${visuals.concrete},
    ${visuals.abstract},
    ${visuals.technical},
    
    COMPOSITION:
    ${composition.layout},
    ${composition.focal},
    ${composition.spacing},
    ${composition.depth},
    ${composition.margins},
    
    COLOR SCHEME:
    Primary gradient: ${colors.primary},
    Accent highlights: ${colors.accent},
    ${colors.emotion},
    
    STYLE:
    Modern editorial vector illustration,
    Flat design with subtle gradients and glass morphism effects,
    Isometric technical elements mixed with organic flow,
    Infographic clarity with artistic sophistication,
    Clean geometric shapes with smooth bezier curves,
    Professional digital art quality, ultra-detailed,
    
    ATMOSPHERE:
    ${regional || "Universal technical aesthetic"},
    Conveying trust, innovation, and professional expertise,
    Balanced between technical accuracy and visual appeal,
    
    TECHNICAL REQUIREMENTS:
    High resolution suitable for retina displays,
    Strong contrast for text overlay readability,
    Scalable composition for responsive design,
    Print-ready color profile (sRGB)
  `.trim();

  // Negative prompt
  const negativePrompt = `
    no text, no typography, no letters, no numbers, no logos,
    no human figures, no faces, no hands,
    no photorealistic elements, no photography,
    no cartoon style, no anime, no sketch, no pencil drawing,
    no cluttered composition, no busy patterns,
    no low contrast, no muddy colors, no oversaturation,
    no watermarks, no signatures, no copyright symbols,
    no stock photo aesthetics, no generic clip art,
    avoid cliché business imagery, avoid outdated design trends
  `.trim();

  return {
    prompt: mainPrompt.split('\n').map(line => line.trim()).filter(line => line).join(' '),
    negativePrompt: negativePrompt.split('\n').map(line => line.trim()).filter(line => line).join(' '),
    parameters: {
      width: 1920,
      height: 1080,
      quality: "high",
      stylePreset: "digital-art",
      cfgScale: 7.5,
      steps: 30
    }
  };
}

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
        // Use advanced prompt generator
        const advancedPrompt = createAdvancedPrompt(content as ContentData);
        
        // Also generate XAI-enhanced version for comparison
        const systemPrompt = `You are an expert at refining and enhancing image generation prompts. 
        Take the provided technical prompt and enhance it with additional creative details while maintaining the core requirements.
        Focus on making the prompt more specific and visually rich.`;
        
        const userPrompt = `Enhance and refine this image generation prompt, adding more specific visual details:

        BASE PROMPT:
        ${advancedPrompt.prompt}

        NEGATIVE PROMPT:
        ${advancedPrompt.negativePrompt}

        Keep the same style and requirements but add more creative visual elements and specific details.`;

        let enhancedPrompt = advancedPrompt.prompt;
        try {
          enhancedPrompt = await callXAIAPI(userPrompt, systemPrompt);
        } catch (error) {
          console.log("Using base prompt without XAI enhancement", error);
        }
        
        prompts.push({
          contentId: content.id,
          prompt: enhancedPrompt.trim(),
          negativePrompt: advancedPrompt.negativePrompt,
          parameters: advancedPrompt.parameters
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
            metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({ 
              promptGeneratedAt: new Date().toISOString(),
              promptGenerator: 'xai-advanced',
              negativePrompt: item.negativePrompt,
              imageParameters: item.parameters
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