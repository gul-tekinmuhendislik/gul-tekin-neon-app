
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

const GEMINI_API_KEY = 'AIzaSyBX6KZsqulgdnTKvabZu2A6uNWPHNO1cw4';
const MODEL = 'gemini-2.5-flash';

async function callGemini(content: string, topic: string, products: string[], blogId: number): Promise<string> {
  const systemPrompt = `Sen bir SEO uzmanısın. Gül-Tekin Mühendislik için blog içeriklerini SEO uyumlu hale getiriyorsun.

Kurallar:
1. İçeriği daha SEO uyumlu yeniden yaz
2. Meta title (max 60 karakter), meta description (max 160 KARAKTER ÇOK ÖNEMLİ!) oluştur
3. Keywords DİZİ (array) olarak oluştur, max 15 kelime. Örnek: ["kelime1", "kelime2"]
4. Sadece geçerli JSON döndür
5. meta_description kesinlikle 160 karakteri geçmesin!
6. slug benzersiz olmalı! slug'ın sonuna MUTLAKA "${blogId}" ekle!

Ürünler: ${products.join(', ')}

JSON formatı:
{
  "title": "Yeni SEO uyumlu başlık",
  "slug": "benzersiz-url-slug-${blogId}",
  "meta_title": "SEO başlığı",
  "meta_description": "Meta açıklama (max 160 karakter)",
  "keywords": ["keyword1", "keyword2"],
  "content": "Güncellenmiş içerik (markdown formatında)"
}`;

  const fullPrompt = `${systemPrompt}

Konu: ${topic}

Mevcut içerik:
${content.substring(0, 4000)}

Yukarıdaki içeriği SEO uyumlu hale getir ve JSON olarak döndür. 
- keywords mutlaka Array formatında olsun: ["kelime1", "kelime2"]
- meta_description 160 KARAKTERİ GEÇMESİN!
- slug MUTLAKA benzersiz olmalı ve "${blogId}" içermelidir! Örnek: "bodrum-milas-akilli-sulama-19" not "bodrum-milas-akilli-sulama-sistemleri-gul-tekin"`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    }
  );

  const data = await response.json();
  
  if (data.error) {
    console.log('❌ API Error:', data.error.message);
    throw new Error(data.error.message);
  }
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

async function getProductsByTopic(topic: string): Promise<string[]> {
  const topicMap: Record<string, string[]> = {
    'Isı Pompası Sistemleri': ['Vaillant', 'Viessman', 'Baymak', 'LG', 'Panasonic', 'Solimpeks'],
    'Su Depoları ve Hidrofor Sistemleri': ['Wilo', 'Grundfos', 'Wepomp', 'Yelkenci', 'Beşer', 'Atlantis'],
    'Su Arıtma Sistemleri': ['Aqualine', 'Atlas', 'Rain Bird'],
    'Sulama Sistemleri': ['Rain Bird', 'Hakan Plastik'],
    'Güneş Enerjisi': ['Eraslan', 'Burak', 'Fronius', 'Jinko']
  };
  
  return topicMap[topic] || ['Various'];
}

function generateUniqueSlug(topic: string, blogId: number): string {
  const topicSlug = topic.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9çğıöşü-]/g, '')
    .replace(/-+/g, '-');
  return `${topicSlug}-${blogId}`;
}

async function updateBlog(id: number) {
  const blogs = await sql`SELECT * FROM generated_content WHERE id = ${id}`;
  
  if (blogs.length === 0) {
    console.log('❌ Blog bulunamadı!');
    return false;
  }
  
  const blog = blogs[0];
  console.log(`\n📝 Güncelleniyor: ID ${id} - ${blog.topic}`);
  console.log(`   Mevcut başlık: ${blog.title}`);
  
  const products = await getProductsByTopic(blog.topic);
  console.log(`   İlgili ürünler: ${products.join(', ')}`);
  
  try {
    const llmResponse = await callGemini(blog.content, blog.topic, products, id);
    console.log(`\n🤖 Gemini Yanıtı (ilk 500 karakter):`);
    console.log(llmResponse.substring(0, 500));
    
    // Parse JSON
    let jsonStr = llmResponse;
    if (llmResponse.includes('```json')) {
      jsonStr = llmResponse.replace(/```json/, '').replace(/```/, '');
    } else if (llmResponse.includes('```')) {
      jsonStr = llmResponse.replace(/```/, '').replace(/```/, '');
    }
    
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const updated = JSON.parse(jsonMatch[0]);
      
      // Handle keywords - ensure it's an array
      let keywords = updated.keywords;
      if (typeof keywords === 'string') {
        keywords = keywords.split(',').map((k: string) => k.trim().replace(/^["']|["']$/g, ''));
      }
      if (!Array.isArray(keywords)) {
        keywords = [String(keywords)];
      }
      
      // Always use generated unique slug with ID
      let slug = generateUniqueSlug(updated.title || blog.topic, id);
      
      // Truncate meta_description to max 200 chars (DB limit)
      const metaDesc = updated.meta_description?.substring(0, 195) || '';
      
      // Update database
      await sql`
        UPDATE generated_content
        SET 
          title = ${updated.title},
          slug = ${slug},
          meta_title = ${updated.meta_title?.substring(0, 95) || ''},
          meta_description = ${metaDesc},
          keywords = ${keywords},
          content = ${updated.content},
          updated_at = NOW()
        WHERE id = ${id}
      `;
      
      console.log(`\n✅ Başarıyla güncellendi!`);
      console.log(`   Yeni başlık: ${updated.title}`);
      console.log(`   Yeni slug: ${slug}`);
      console.log(`   Keywords: ${keywords.length} kelime`);
      return true;
    } else {
      console.log('❌ JSON parse hatası!');
      return false;
    }
  } catch (error: any) {
    console.error('❌ Hata:', error.message || error);
    return false;
  }
}

// Get all blog IDs and process one by one
async function updateAllBlogs() {
  const blogs = await sql`
    SELECT id FROM generated_content 
    WHERE status = 'published' 
    ORDER BY id ASC
  `;
  
  console.log(`\n📋 Toplam ${blogs.length} blog güncellenecek.\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const blog of blogs) {
    console.log(`\n=== Blog ID: ${blog.id} ===`);
    const success = await updateBlog(blog.id);
    if (success) successCount++;
    else failCount++;
    
    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log(`\n✅ Tüm bloglar güncellendi! Başarılı: ${successCount}, Başarısız: ${failCount}`);
}

// Run with specific ID or all
const blogId = process.argv[2];
if (blogId) {
  updateBlog(parseInt(blogId));
} else {
  updateAllBlogs();
}

