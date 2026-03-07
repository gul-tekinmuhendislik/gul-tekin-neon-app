import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);

// Local LLM API call
async function callLocalLLM(content: string, topic: string, products: string[]): Promise<string> {
  const systemPrompt = `Sen bir SEO uzmanısın. Gül-Tekin Mühendislik için blog içeriklerini SEO uyumlu hale getiriyorsun.

Kurallar:
1. İçeriği daha SEO uyumlu yeniden yaz
2. Meta title (max 60 karakter), meta description (max 160 karakter) oluştur
3. Keywords (virgülle ayrılmış, max 15 kelime) oluştur
4. Updated-at tarihini güncelle
5. Sadece JSON döndür

Ürünler: ${products.join(', ')}

JSON formatı:
{
  "title": "Yeni SEO uyumlu başlık",
  "slug": "url-slug",
  "meta_title": "SEO başlığı",
  "meta_description": "Meta açıklama",
  "keywords": ["keyword1", "keyword2"],
  "content": "Güncellenmiş içerik (markdown formatında)"
}`;

  const response = await fetch('http://localhost:1234/api/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemma-3-4b',
      system_prompt: systemPrompt,
      input: `Konu: ${topic}\n\nMevcut içerik:\n${content.substring(0, 3000)}`
    })
  });

  const data = await response.json();
  return data.output?.[0]?.content || '';
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

async function updateBlog(id: number) {
  // Get blog content
  const blogs = await sql`
    SELECT * FROM generated_content WHERE id = ${id}
  `;
  
  if (blogs.length === 0) {
    console.log('❌ Blog bulunamadı!');
    return;
  }
  
  const blog = blogs[0];
  console.log(`\n📝 Güncelleniyor: ID ${id} - ${blog.topic}`);
  console.log(`   Mevcut başlık: ${blog.title}`);
  
  // Get related products
  const products = await getProductsByTopic(blog.topic);
  console.log(`   İlgili ürünler: ${products.join(', ')}`);
  
  try {
    // Call local LLM
    const llmResponse = await callLocalLLM(blog.content, blog.topic, products);
    console.log(`\n🤖 LLM Yanıtı:`);
    console.log(llmResponse.substring(0, 500) + '...');
    
    // Parse JSON response
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const updated = JSON.parse(jsonMatch[0]);
      
      // Update database
      await sql`
        UPDATE generated_content
        SET 
          title = ${updated.title},
          slug = ${updated.slug},
          meta_title = ${updated.meta_title},
          meta_description = ${updated.meta_description},
          keywords = ${updated.keywords},
          content = ${updated.content},
          updated_at = NOW()
        WHERE id = ${id}
      `;
      
      console.log(`\n✅ Başarıyla güncellendi!`);
      console.log(`   Yeni başlık: ${updated.title}`);
      console.log(`   Yeni slug: ${updated.slug}`);
    } else {
      console.log('❌ JSON parse hatası!');
    }
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

// Get blog ID from command line
const blogId = parseInt(process.argv[2]) || 131;
updateBlog(blogId);

