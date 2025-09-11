import { inngest } from "../lib/inngest/client";
import { sql } from "../lib/db";

async function generateAllPrompts() {
  console.log('🎨 Prompt Generation Script');
  console.log('===========================');
  
  // Prompt'ı boş olan kayıtları getir
  const contents = await sql`
    SELECT id, topic, title
    FROM generated_content
    WHERE prompt IS NULL
    ORDER BY id
  `;
  
  console.log(`\n📊 Durum:`);
  console.log(`Toplam ${contents.length} kayıt için prompt oluşturulacak`);
  
  const batchSize = 5; // Her seferde 5 kayıt işle
  const batches = [];
  
  // Kayıtları batch'lere böl
  for (let i = 0; i < contents.length; i += batchSize) {
    batches.push(contents.slice(i, i + batchSize));
  }
  
  console.log(`${batches.length} batch halinde işlenecek (her batch ${batchSize} kayıt)`);
  
  // Her batch'i işle
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`\n📦 Batch ${batchIndex + 1}/${batches.length} işleniyor...`);
    
    for (const content of batch) {
      console.log(`  ID ${content.id}: ${content.topic}`);
      
      try {
        const result = await inngest.send({
          name: 'content/generate-prompt.xai',
          data: {
            contentId: content.id,
            batchProcess: false
          }
        });
        
        console.log(`  ✅ Event gönderildi: ${result.ids[0]}`);
        
        // API'ye aşırı yüklenmemek için kısa bekleme
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error: any) {
        console.error(`  ❌ Hata:`, error.message);
      }
    }
    
    // Batch'ler arası bekleme
    if (batchIndex < batches.length - 1) {
      console.log(`\n⏳ Sonraki batch için 5 saniye bekleniyor...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Sonuçları kontrol et
  console.log('\n📊 Final Durum Kontrolü...');
  const finalStats = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE prompt IS NULL) as without_prompt,
      COUNT(*) FILTER (WHERE prompt IS NOT NULL) as with_prompt,
      COUNT(*) as total
    FROM generated_content
  `;
  
  console.log(`Toplam: ${finalStats[0].total}`);
  console.log(`Prompt'ı OLAN: ${finalStats[0].with_prompt}`);
  console.log(`Prompt'ı BOŞ: ${finalStats[0].without_prompt}`);
  
  console.log('\n✨ İşlem tamamlandı!');
  console.log('Inngest dashboard: http://localhost:8288');
}

generateAllPrompts()
  .then(() => {
    console.log('\n🎉 Script başarıyla tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script hatası:', error);
    process.exit(1);
  });