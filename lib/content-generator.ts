import Groq from "groq-sdk";
import Exa from "exa-js";
import { sql } from "./db";
import { inngest } from "./inngest/client";

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

// SEO başlık template'leri - her içerik üretiminde rastgele seçilecek
const titleTemplates = [
  "{topic} 2024: En İyi Modeller ve Fiyatlar",
  "Bodrum'da {topic} Kurulumu ve Servisi",
  "{topic} Seçimi: Profesyonel Rehber",
  "{topic} Karşılaştırma ve İnceleme",
  "Ev İçin {topic}: Nasıl Seçilir?",
  "{topic} Montajı: Adım Adım Kılavuz",
  "{topic} Bakımı ve Onarımı İpuçları",
  "En Verimli {topic} Modelleri",
  "{topic}: Avantajları ve Dezavantajları",
  "{topic} Fiyatları ve Maliyet Analizi",
  "Profesyonel {topic} Çözümleri",
  "{topic} Hakkında Bilmeniz Gerekenler",
  "Enerji Tasarruflu {topic} Rehberi",
  "{topic} Teknolojisi ve Yenilikleri",
  "{topic}: Sıkça Sorulan Sorular"
];

// Rastgele başlık template'i seçme fonksiyonu
function getRandomTitleTemplate(): string {
  return titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
}

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

**SEO BAŞLIK KURALLARI - ÇOK ÖNEMLİ:**
- ASLA sadece konu adını başlık olarak kullanma (örn: "Su Arıtma Sistemleri" DEĞİL)
- Her başlık BENZERSİZ ve İLGİ ÇEKİCİ olmalı
- Başlıkta sayı, fayda veya çözüm odaklı kelimeler kullan
- Örnekler:
  * "2024'te Su Arıtma Sistemleri: En İyi 5 Model"
  * "Bodrum'da Su Arıtma Çözümleri: Rehber"
  * "Ev İçin Su Arıtma: Nasıl Seçilir?"
  * "Su Arıtma Sistemleri Karşılaştırma ve Fiyatlar"
  * "Profesyonel Su Arıtma Kurulumu: Adım Adım"
- Başlık varyasyonları kullan: Rehber, İpuçları, Karşılaştırma, En İyi, Nasıl, Neden, vb.

**İÇERİK KURALLARI:**
- ASLA başka şirket ismi veya markası belirtme (sadece yukarıda listelenen çalıştığımız markalar hariç)
- ASLA dış web sitelerine link verme (sadece gul-tekinmuhendislik.com hariç)
- Rakip firma isimlerinden, linklerinden ve referanslarından kaçın
- Genel sektörel bilgi ve teknik detaylara odaklan

**Çıktı Formatı:**
- Markdown formatında blog yazısı
- SEO başlığı (50-60 karakter, BENZERSİZ ve ilgi çekici)
- URL Slug (URL dostu format, Türkçe karakterler olmadan, küçük harf ve tire ile ayrılmış)
- Meta açıklama (150-160 karakter, tıklanmayı teşvik edici)
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
    // Filter and clean search results - remove competitor links and company names
    const cleanedSearchData = searchData.map((item, index) => {
      // Remove URLs except gul-tekinmuhendislik.com
      let cleanedContent = item.content.replace(/https?:\/\/(?!gul-tekinmuhendislik\.com)[^\s]+/gi, '[link kaldırıldı]');
      
      // Remove competitor company names (common patterns)
      const competitorPatterns = [
        /\b(?:Ltd|A\.Ş\.|A\.S\.|Şti\.|LTD|ŞTİ)\.?\b/gi,
        /\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s+(?:Mühendislik|Mekanik|Tesisat|İnşaat|Enerji|Sistem|Teknoloji)\b/gi,
        /\b(?:www\.|http|\.com|\.tr|\.net|\.org)\b/gi
      ];
      
      competitorPatterns.forEach(pattern => {
        cleanedContent = cleanedContent.replace(pattern, '');
      });
      
      // Clean title as well
      let cleanedTitle = item.title;
      competitorPatterns.forEach(pattern => {
        cleanedTitle = cleanedTitle.replace(pattern, '');
      });
      
      return `[${index + 1}] ${cleanedTitle}\n${cleanedContent}\nKaynak: Sektörel araştırma`;
    });
    
    // Prepare context from cleaned search results
    const searchContext = cleanedSearchData.join("\n\n");

    // Dinamik başlık önerisi oluştur
    const suggestedTitle = getRandomTitleTemplate().replace("{topic}", topic);

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

Önerilen SEO Başlığı: "${suggestedTitle}" (Bu öneriyi temel al ama daha da geliştirebilirsin)

Yukarıdaki araştırma verilerini kullanarak, "${topic}" konusunda detaylı bir blog yazısı oluştur. Yazı markdown formatında olmalı ve şu bölümleri içermeli:

1. ## Başlık
2. ### Giriş
3. ### ${topic} Nedir ve Nasıl Çalışır?
4. ### Avantajları ve Faydaları
5. ### Ürün Türleri ve Özellikler
6. ### Bodrum/Milas Bölgesinde ${topic}
7. ### Kurulum ve Bakım
8. ### Sonuç

BAŞLIK KURALI: Önerilen başlığı kullan veya benzer tarzda BENZERSİZ ve ilgi çekici bir başlık oluştur. ASLA sadece "${topic}" şeklinde basit başlık kullanma!

İÇERİK KURALLARI:
- ASLA başka şirket ismi belirtme
- ASLA dış web sitelerine link verme veya URL paylaşma
- Sadece Gül-Tekin Mühendislik'ten bahset
- Teknik bilgiye ve genel sektörel bilgilere odaklan

Ayrıca şunları da ekle:
- **SEO Başlığı:** (50-60 karakter, benzersiz ve ilgi çekici)
- **URL Slug:** (URL dostu format, örnek: isi-pompasi-sistemleri-2024)
- **Meta Açıklama:** (150-160 karakter, tıklanmayı teşvik edici)
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
    const slugMatch = content.match(/\*\*URL Slug:\*\* (.+)/);
    const metaDescMatch = content.match(/\*\*Meta Açıklama:\*\* (.+)/);
    const keywordsMatch = content.match(/\*\*Anahtar Kelimeler:\*\* (.+)/);
    
    const seoTitle = seoTitleMatch ? seoTitleMatch[1] : `${topic} - Gül-Tekin Mühendislik`;
    // Slug'a tarih ekleyerek benzersizlik sağla
    const baseSlug = slugMatch ? slugMatch[1] : generateSlug(topic);
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında
    const slug = `${baseSlug}-${dateStr}`;
    const metaDesc = metaDescMatch ? metaDescMatch[1] : `${topic} hakkında detaylı bilgi ve çözümler`;
    const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [topic];

    return {
      content,
      seoTitle,
      slug,
      metaDescription: metaDesc,
      keywords
    };
  } catch (error) {
    console.error("Error generating content with Groq:", error);
    throw error;
  }
}

function generateSlug(text: string): string {
  const turkishMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  };

  // Türkçe karakterleri değiştir
  let slug = text;
  for (const [turkish, english] of Object.entries(turkishMap)) {
    slug = slug.replace(new RegExp(turkish, 'g'), english);
  }

  // Slug oluştur
  slug = slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Özel karakterleri kaldır
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap
    .replace(/^-+|-+$/g, ''); // Baş ve sondaki tireleri kaldır

  return slug;
}

export async function saveGeneratedContent(
  topic: string,
  title: string,
  content: string,
  slug: string,
  metaTitle: string,
  metaDescription: string,
  keywords: string[],
  searchData: SearchDataItem[]
) {
  try {
    // Slug zaten tarih içerdiği için benzersiz olacaktır
    const result = await sql`
      INSERT INTO generated_content (
        topic,
        title,
        content,
        slug,
        meta_title,
        meta_description,
        keywords,
        search_data,
        status,
        published_at
      ) VALUES (
        ${topic},
        ${title},
        ${content},
        ${slug},
        ${metaTitle},
        ${metaDescription},
        ${keywords},
        ${JSON.stringify(searchData)},
        'published',
        NOW()
      )
      RETURNING id, topic, slug, created_at
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
      generated.slug,
      generated.seoTitle,
      generated.metaDescription,
      generated.keywords,
      searchData
    );
    
    console.log(`💾 Content saved with ID: ${saved.id}`);
    
    // Step 4: Trigger content.created event for further processing
    await inngest.send({
      name: "content/created",
      data: {
        contentId: saved.id,
        topic: saved.topic,
        createdAt: saved.created_at
      }
    });
    console.log(`📨 Content created event triggered for ID: ${saved.id}`);
    
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