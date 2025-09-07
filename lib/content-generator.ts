import Groq from "groq-sdk";
import Exa from "exa-js";
import { sql } from "./db";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const exa = new Exa(process.env.EXA_API_KEY || "");

export const engineeringTopics = [
  "Isı Pompası Sistemleri",
  "Güneş Enerjisi Sistemleri",
  "Su Depoları ve Hidrofor Sistemleri",
  "Yerden Isıtma Sistemleri",
  "Su Arıtma Sistemleri",
  "Klima Sistemleri",
  "Sulama Sistemleri",
  "Termosifonik Sistemler"
];

const contentPrompt = `Sen, Gül-Tekin Mühendislik'in dijital içerik stratejisti ve üreticisi bir AI agentsin. Amacın, şirketimizin uzmanlık alanları olan enerji verimliliği, çevresel sürdürülebilirlik, konfor ve güvenilirliğe vurgu yaparak, hedef kitlemiz (konut sahipleri, villa sahipleri, ticari işletmeler, site yöneticileri) için bilgilendirici, eğitici ve etkileşimli içerikler oluşturmaktır.

**Şirket Bilgileri:**
- Firma: Gül-Tekin Mühendislik
- Lokasyon: Bodrum/Milas bölgesi
- Uzmanlık: Mekanik tesisat sistemleri, enerji verimliliği çözümleri
- Çalıştığımız Markalar: Aldea, Varmeks, LG, Solimpeks, Baymak, Alarko, Toshiba, Beşer, Yelkenci, PH Mekanik, Wilo, Wepomp, Atlantis, Grundfos, Standart, Caleffi, EDS, Teksan, ECA, Demirdöküm, Nobo, Radyal, REHAU, TDS, Vesbo, Honeywell, Siemens, Rain Bird, Hakan Plastik, Vitra, Baylan, Aqualine, Atlas, Element, Sanihydro, Sukar, Burak, General, Panasonic, Jinko, Fronius, Eraslan

**İçerik Gereksinimleri:**
1. En az 750 kelimelik detaylı, SEO dostu blog yazısı
2. Ürün/hizmetin tanımı ve çalışma prensibi
3. Avantajları ve faydaları (enerji verimliliği, maliyet tasarrufu, çevre dostu)
4. Ürün türleri ve modelleri (markalara özel özellikler)
5. Teknolojik özellikler (Wi-Fi kontrol, IoT, akıllı sistemler)
6. Bodrum/Milas bölgesine özel avantajlar
7. Kurulum, bakım ve geri ödeme süresi bilgileri
8. Profesyonel ve anlaşılır dil kullanımı

**Çıktı Formatı:**
- Markdown formatında blog yazısı
- SEO başlığı (50-60 karakter)
- Meta açıklama (150-160 karakter)
- En az 10 anahtar kelime
- Bilgi kaynaklarını [1], [2] şeklinde numaralandır`;

export async function searchTopicContent(topic: string) {
  try {
    // Search for content with Exa - with full text content
    const searchQuery = `${topic} Türkiye teknoloji yenilikler avantajlar kurulum`;
    // Get content from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const results = await exa.searchAndContents(searchQuery, {
      type: "auto",
      numResults: 5,  // Get more to have variety after filtering
      startPublishedDate: thirtyDaysAgo.toISOString().split('T')[0],
      excludeDomains: ["wikipedia.org", "wikimedia.org"],  // Exclude generic sources
      text: {
        maxCharacters: 1000,  // Optimized content size
        includeHtmlTags: false
      }
    });

    // Extract relevant information
    const searchData = results.results.map(r => ({
      title: r.title || 'Untitled',
      url: r.url,
      content: r.text?.substring(0, 1000) || ''
    }));

    return searchData;
  } catch (error) {
    console.error("Error searching with Exa:", error);
    return [];
  }
}

interface SearchDataItem {
  title: string;
  url: string;
  content: string;
}

export async function generateContent(topic: string, searchData: SearchDataItem[]) {
  try {
    // Prepare context from search results
    const searchContext = searchData.map((item, index) => 
      `[${index + 1}] ${item.title}\n${item.content}\nKaynak: ${item.url}`
    ).join("\n\n");

    // Generate content with Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: contentPrompt
        },
        {
          role: "user",
          content: `Konu: ${topic}

Araştırma Verileri:
${searchContext}

Yukarıdaki araştırma verilerini kullanarak, "${topic}" konusunda detaylı bir blog yazısı oluştur. Yazı markdown formatında olmalı ve şu bölümleri içermeli:

1. ## Başlık
2. ### Giriş
3. ### ${topic} Nedir ve Nasıl Çalışır?
4. ### Avantajları ve Faydaları
5. ### Ürün Türleri ve Özellikler
6. ### Bodrum/Milas Bölgesinde ${topic}
7. ### Kurulum ve Bakım
8. ### Sonuç

Ayrıca şunları da ekle:
- **SEO Başlığı:** (50-60 karakter)
- **Meta Açıklama:** (150-160 karakter)
- **Anahtar Kelimeler:** (virgülle ayrılmış en az 10 kelime)`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2500  // Optimized for rate limits
    });

    const content = completion.choices[0]?.message?.content || "";
    
    // Parse SEO elements from content
    const seoTitleMatch = content.match(/\*\*SEO Başlığı:\*\* (.+)/);
    const metaDescMatch = content.match(/\*\*Meta Açıklama:\*\* (.+)/);
    const keywordsMatch = content.match(/\*\*Anahtar Kelimeler:\*\* (.+)/);
    
    const seoTitle = seoTitleMatch ? seoTitleMatch[1] : `${topic} - Gül-Tekin Mühendislik`;
    const metaDesc = metaDescMatch ? metaDescMatch[1] : `${topic} hakkında detaylı bilgi ve çözümler`;
    const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [topic];

    return {
      content,
      seoTitle,
      metaDescription: metaDesc,
      keywords
    };
  } catch (error) {
    console.error("Error generating content with Groq:", error);
    throw error;
  }
}

export async function saveGeneratedContent(
  topic: string,
  title: string,
  content: string,
  metaTitle: string,
  metaDescription: string,
  keywords: string[],
  searchData: SearchDataItem[]
) {
  try {
    const result = await sql`
      INSERT INTO generated_content (
        topic,
        title,
        content,
        meta_title,
        meta_description,
        keywords,
        search_data,
        status
      ) VALUES (
        ${topic},
        ${title},
        ${content},
        ${metaTitle},
        ${metaDescription},
        ${keywords},
        ${JSON.stringify(searchData)},
        'draft'
      )
      RETURNING id, topic, created_at
    `;
    
    return result[0];
  } catch (error) {
    console.error("Error saving content:", error);
    throw error;
  }
}

export async function generateAndSaveContent(topic: string) {
  try {
    console.log(`📝 Generating content for: ${topic}`);
    
    // Step 1: Search for information
    const searchData = await searchTopicContent(topic);
    console.log(`🔍 Found ${searchData.length} search results`);
    
    // Step 2: Generate content
    const generated = await generateContent(topic, searchData);
    console.log(`✍️ Content generated successfully`);
    
    // Step 3: Save to database
    const saved = await saveGeneratedContent(
      topic,
      generated.seoTitle,
      generated.content,
      generated.seoTitle,
      generated.metaDescription,
      generated.keywords,
      searchData
    );
    
    console.log(`💾 Content saved with ID: ${saved.id}`);
    
    return {
      success: true,
      contentId: saved.id,
      topic: saved.topic,
      createdAt: saved.created_at
    };
  } catch (error) {
    console.error("Error in content generation process:", error);
    throw error;
  }
}