const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL);

// Varmeks blog konuları - detaylı prompt'larla
const VARMeks_BLOG_TOPICS = [
  {
    topic: "Varmeks Varm Up Serisi Isı Pompaları: -30°C'ye Kadar Yüksek Performans",
    imagePrompt: "A modern Varmeks Varm Up heat pump outdoor unit mounted on a white wall of a contemporary villa in Bodrum Turkey, Mediterranean landscape visible in background, blue sky, professional product photography, clean white and gray colors, winter setting with frost visible, high-end residential setting, 4k quality"
  },
  {
    topic: "Varmeks Varm Boost R290 Isı Pompası: Çevre Dostu Soğutucu Akışkan Teknolojisi",
    imagePrompt: "Close-up of Varmeks Varm Boost heat pump unit with visible R290 eco-friendly refrigerant labeling, green technology concept, sustainable energy theme, blue and green color gradient background, modern engineering design, professional product shot"
  },
  {
    topic: "Varmeks Varm All Sıcak Suyu Isı Pompası: 200-300L Tank Kapasitesi",
    imagePrompt: "Varmeks Varm All hot water heat pump with 200L stainless steel tank in a modern utility room, clean installation, LED display showing 75°C, warm water technology, energy efficient home solution, professional plumbing setup"
  },
  {
    topic: "Varmeks Varm Silent Pool: Sessiz Çalışan Havuz Isı Pompası (10-33kW)",
    imagePrompt: "Varmeks Varm Silent Pool heat pump installed next to a crystal clear swimming pool in a luxury Bodrum resort, peaceful garden setting, silent operation concept, blue water reflections, tropical plants, 5-star hotel quality installation"
  },
  {
    topic: "Varmeks Commercial Duo: Ticari Yapılar için 50-92kW Isı Pompası Çözümleri",
    imagePrompt: "Multiple Varmeks Commercial Duo heat pumps installed on the roof of a modern commercial building in Turkey, industrial scale heating solution, blue sky backdrop, professional HVAC installation, energy efficient business solution"
  },
  {
    topic: "Varmeks Commercial Pool: Ticari Havuzlar için 26-145kW Yüksek Kapasite Isı Pompası",
    imagePrompt: "Large Varmeks Commercial Pool heat pump system at an Olympic-sized indoor swimming pool facility, professional aquatic center, modern architecture, clean blue water, commercial grade HVAC equipment"
  },
  {
    topic: "Varmeks Isı Pompası Fiyatları 2025: Detaylı Maliyet Analizi ve Tasarruf Rehberi",
    imagePrompt: "Infographic style image showing heat pump cost comparison chart with Turkish Lira symbols, energy savings graph, Varmeks product lineup with price indicators, modern office setting with laptop showing calculations, professional financial analysis theme"
  },
  {
    topic: "Varmeks vs LG vs Bosch Isı Pompaları: 2025 Karşılaştırma Rehberi",
    imagePrompt: "Three premium heat pump units side by side comparison - Varmeks, LG Therma V, and Bosch - in a modern showroom setting, Turkish flag subtle accent, technical specification overlay, professional comparison review style, blue and silver color scheme"
  },
  {
    topic: "Varmeks Isı Pompası Garantisi ve Teknik Destek: Kapsamlı Servis Rehberi",
    imagePrompt: "Professional Varmeks service technician in uniform working on a heat pump unit, toolbox and diagnostic equipment visible, warranty document in background, customer service excellence theme, Gül-Tekin Mühendislik branded van in background, Bodrum villa setting"
  },
  {
    topic: "Varmeks Isı Pompaları Neden Tercih Edilir? 2025 Alın Teri Rehberi",
    imagePrompt: "Happy Turkish family in a warm living room during winter, Varmeks heat pump indoor unit visible on wall, comfort and warmth theme, energy bill savings concept, modern Turkish home interior, Bodrum/Milas coastal landscape visible through window"
  }
];

async function main() {
  console.log('=== VARMeks BLOG ICERIK OLUSTURMA (OpenRouter) ===\n');

  const results = [];

  for (let i = 0; i < VARMeks_BLOG_TOPICS.length; i++) {
    const { topic, imagePrompt } = VARMeks_BLOG_TOPICS[i];
    console.log(`[${i + 1}/10] İşleniyor: ${topic.substring(0, 50)}...`);

    try {
      // OpenRouter ile içerik oluştur
      const content = await generateWithOpenRouter(topic);

      // Veritabanına kaydet
      const saved = await sql`
        INSERT INTO generated_content (
          topic,
          title,
          content,
          slug,
          meta_title,
          meta_description,
          keywords,
          image_prompt,
          status,
          published_at
        ) VALUES (
          ${topic},
          ${content.seoTitle},
          ${content.content},
          ${content.slug},
          ${content.seoTitle},
          ${content.metaDescription},
          ${content.keywords},
          ${imagePrompt},
          'published',
          NOW()
        )
        RETURNING id, slug
      `;

      results.push({
        id: saved[0].id,
        topic: topic,
        slug: saved[0].slug,
        imagePrompt: imagePrompt,
        status: 'success'
      });

      console.log(`   ✅ Kaydedildi (ID: ${saved[0].id})`);
    } catch (error) {
      console.log(`   ❌ Hata: ${error.message}`);
      results.push({
        topic: topic,
        imagePrompt: imagePrompt,
        status: 'failed',
        error: error.message
      });
    }

    // Rate limit için bekle
    await sleep(2000);
  }

  // Özet
  console.log('\n\n=== OZET ===');
  const success = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  console.log(`Basarili: ${success.length}`);
  console.log(`Basarisiz: ${failed.length}`);

  // Image prompt listesi
  console.log('\n\n=== GEMINI RESIM PROMPT\'LARI ===\n');
  results.forEach((r, i) => {
    if (r.status === 'success') {
      console.log(`--- Blog ${i + 1}: ${r.topic.substring(0, 40)}... ---`);
      console.log(`ID: ${r.id}`);
      console.log(`Slug: ${r.slug}`);
      console.log(`\nImage Prompt (Gemini):`);
      console.log(r.imagePrompt);
      console.log('\n');
    }
  });
}

// OpenRouter ile içerik oluştur
async function generateWithOpenRouter(topic) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://gul-tekinmuhendislik.com',
      'X-Title': 'Gül-Tekin Mühendislik Blog Generator'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001:free',
      messages: [
        {
          role: 'system',
          content: `Sen, Gül-Tekin Mühendislik'in dijital içerik stratejisti ve üreticisi bir AI agentsin. Amacın, şirketimizin uzmanlık alanları olan enerji verimliliği, çevresel sürdürülebilirlik, konfor ve güvenilirliğe vurgu yaparak, hedef kitlemiz (konut sahipleri, villa sahipleri, ticari işletmeler, site yöneticileri) için bilgilendirici, eğitici ve etkileşimli içerikler oluşturmaktır.

Şirket Bilgileri:
- Firma: Gül-Tekin Mühendislik
- Lokasyon: Bodrum/Milas bölgesi
- Uzmanlık: Mekanik tesisat sistemleri, enerji verimliliği çözümleri
- Ana Marka: Varmeks Isı Pompaları (Türkiye'nin yerli üretimi)

İçerik Gereksinimleri:
1. En az 800 kelimelik detaylı, SEO dostu blog yazısı
2. Ürün/hizmetin tanımı ve çalışma prensibi
3. Avantajları ve faydaları (enerji verimliliği, maliyet tasarrufu, çevre dostu)
4. Varmeks markasına özel özellikler ve teknolojiler
5. Wi-Fi kontrol, DC Inverter, akıllı sistemler
6. Bodrum/Milas bölgesine özel avantajlar
7. Kurulum, bakım ve geri ödeme süresi bilgileri
8. Profesyonel ve anlaşılır dil kullanımı

KURALLAR:
- ASLA başka şirket ismi belirtme (Varmeks hariç)
- ASLA dış web sitelerine link verme
- Varmeks markasını öne çıkar
- Türkçe karakterler kullan (ı, ş, ç, ğ, ö, ü)
- Varmeks Türkiye'nin yerli üretimi vurgusu yap

Çıktı Formatı:
- Markdown formatında blog yazısı
- SEO başlığı (50-60 karakter)
- URL Slug (URL dostu, Türkçe karakterler olmadan)
- Meta açıklama (150-160 karakter)
- En az 10 anahtar kelime`
        },
        {
          role: 'user',
          content: `Konu: ${topic}

Bu konuda detaylı bir blog yazısı oluştur. Varmeks markasına özel bilgiler içersin. Yazı markdown formatında olsun ve şu bölümleri içersin:

1. SEO Başlığı (50-60 karakter, Varmeks vurgulu)
2. URL Slug (örn: varmeks-varm-up-serisi)
3. Meta Açıklama (150-160 karakter)
4. Anahtar Kelimeler (virgülle ayrılmış, en az 10)
5. Blog İçeriği:
   - Giriş
   - Varmeks Varm Up Serisi Nedir?
   - Teknik Özellikler (kW kapasitesi, soğutucu gaz, COP değeri)
   - Avantajları (enerji tasarrufu, çevre dostu, sessiz çalışma)
   - Bodrum/Milas İçin Avantajlar
   - Kurulum ve Bakım
   - Fiyat ve Maliyet Analizi
   - Sonuç

ÖNEMLİ: Varmeks markasını her bölümde yinele. Yerli üretim vurgusu yap. -30°C çalışma özelliğini vurgula.`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';

  // SEO elementlerini çıkar
  const seoTitleMatch = content.match(/\*\*SEO Başlığı:\*\* (.+)/) || content.match(/SEO Başlığı:\s*(.+)/);
  const slugMatch = content.match(/\*\*URL Slug:\*\* (.+)/) || content.match(/URL Slug:\s*(.+)/);
  const metaDescMatch = content.match(/\*\*Meta Açıklama:\*\* (.+)/) || content.match(/Meta Açıklama:\s*(.+)/);
  const keywordsMatch = content.match(/\*\*Anahtar Kelimeler:\*\* (.+)/) || content.match(/Anahtar Kelimeler:\s*(.+)/);

  const seoTitle = seoTitleMatch ? seoTitleMatch[1].trim() : topic;
  const baseSlug = slugMatch ? slugMatch[1].trim() : topic.toLowerCase().replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const slug = `${baseSlug}-${new Date().toISOString().split('T')[0]}`;
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : `${topic} hakkında detaylı bilgi`;
  const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [topic];

  return {
    content,
    seoTitle,
    slug,
    metaDescription: metaDesc,
    keywords
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e)).finally(() => process.exit(0));
