import { inngest } from "../lib/inngest/client";
import { sql } from "../lib/db";

async function generateImagesForReadyContent() {
  console.log('🎨 Image Generation Script for Content with Prompts');
  console.log('==================================================');
  
  // Prompt'ı olan ama görseli olmayan içerikleri getir
  const contents = await sql`
    SELECT id, topic, title, prompt
    FROM generated_content
    WHERE prompt IS NOT NULL 
      AND prompt != ''
      AND (image_url IS NULL OR image_url = '')
    ORDER BY created_at DESC
    LIMIT 10
  `;
  
  console.log(`\n📊 Durum:`);
  console.log(`${contents.length} içerik için görsel üretilecek\n`);
  
  if (contents.length === 0) {
    console.log('✅ Görsel üretilecek içerik bulunamadı.');
    return;
  }
  
  // Her içerik için görsel üretimi tetikle
  for (const content of contents) {
    console.log(`\n📝 İşleniyor: ${content.title}`);
    console.log(`   Topic: ${content.topic}`);
    console.log(`   Prompt: ${content.prompt.substring(0, 100)}...`);
    
    try {
      // Fal.ai image generation event'i gönder
      const result = await inngest.send({
        name: 'blog/image.generate.requested',
        data: {
          blogId: content.id,
          prompt: content.prompt,
          model: "fal-ai/flux/schnell", // Hızlı ve kaliteli model
          imageSize: "landscape_16_9",
          numInferenceSteps: 4,
          guidanceScale: 3.5,
          numImages: 1,
          enableSafetyChecker: true
        }
      });
      
      console.log(`   ✅ Event gönderildi: ${result.ids[0]}`);
      
      // API'ye aşırı yüklenmemek için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      console.error(`   ❌ Hata:`, error.message);
    }
  }
  
  console.log('\n⏳ Görsellerin üretilmesi için 30 saniye bekleniyor...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Sonuçları kontrol et
  console.log('\n📊 Final Durum Kontrolü...');
  const finalStats = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE image_url IS NULL OR image_url = '') as without_image,
      COUNT(*) FILTER (WHERE image_url IS NOT NULL AND image_url != '') as with_image,
      COUNT(*) FILTER (WHERE prompt IS NOT NULL AND prompt != '' AND (image_url IS NULL OR image_url = '')) as ready_for_generation,
      COUNT(*) as total
    FROM generated_content
  `;
  
  console.log(`Toplam içerik: ${finalStats[0].total}`);
  console.log(`Görseli OLAN: ${finalStats[0].with_image}`);
  console.log(`Görseli YOK: ${finalStats[0].without_image}`);
  console.log(`Hala bekleyen: ${finalStats[0].ready_for_generation}`);
  
  // Yeni oluşturulan görselleri göster
  const newImages = await sql`
    SELECT id, title, image_url
    FROM generated_content
    WHERE image_url IS NOT NULL 
      AND image_url != ''
      AND id IN (${contents.map(c => c.id).join(',')})
    LIMIT 10
  `;
  
  if (newImages.length > 0) {
    console.log('\n🖼️  Yeni Oluşturulan Görseller:');
    newImages.forEach((img, index) => {
      console.log(`${index + 1}. ${img.title}`);
      console.log(`   URL: ${img.image_url}`);
    });
  }
  
  console.log('\n✨ İşlem tamamlandı!');
  console.log('Inngest dashboard: http://localhost:8288');
}

generateImagesForReadyContent()
  .then(() => {
    console.log('\n🎉 Script başarıyla tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script hatası:', error);
    process.exit(1);
  });