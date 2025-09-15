import { generateDynamicPrompt, generateHourlyVariations, createPromptTrackingTable } from '../lib/dynamic-prompt-generator.ts';
import { sql } from '../lib/db.ts';

async function testDynamicPrompts() {
  console.log('🎨 DİNAMİK PROMPT GENERATOR TEST\n');
  console.log('='.repeat(80));

  try {
    // Create tracking table if not exists
    await createPromptTrackingTable();
    console.log('✅ Tracking table ready\n');

    // Test topics
    const topics = [
      'Su Arıtma Sistemleri',
      'Isı Pompası',
      'Güneş Paneli'
    ];

    console.log('📊 HER KONU İÇİN 3 FARKLI PROMPT ÜRETİLİYOR...\n');
    console.log('Her saat başı farklı kombinasyonlar oluşacak!\n');

    for (const topic of topics) {
      console.log(`\n🔹 KONU: ${topic}`);
      console.log('-'.repeat(60));

      // Generate 3 different variations
      for (let i = 1; i <= 3; i++) {
        console.log(`\n📌 Varyasyon ${i}:`);

        const result = await generateDynamicPrompt({
          topic,
          keywords: ['bodrum', 'ege'], // Optional regional keywords
          forceNewCombination: true
        });

        console.log(`\n🎨 Renk Şeması: ${result.metadata.colorScheme || 'Default'}`);
        console.log(`🖼️ Stil: ${result.metadata.style || 'Standard'}`);
        console.log(`📐 Kompozisyon: ${result.metadata.composition || 'Basic'}`);
        console.log(`🌍 Bölgesel: ${result.metadata.regional || 'Yok'}`);
        console.log(`⏰ Zaman Varyasyonu: ${result.metadata.timeVariation}`);
        console.log(`🔑 Hash: ${result.metadata.combinationHash}`);

        console.log(`\n💬 PROMPT (ilk 200 karakter):`);
        console.log(result.prompt.substring(0, 200) + '...');

        console.log(`\n❌ NEGATIVE (ilk 100 karakter):`);
        console.log(result.negativePrompt.substring(0, 100) + '...');

        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📈 SAATLIK VARYASYON TESTİ:\n');

    // Test hourly variations
    const hourlyTest = await generateHourlyVariations('Neon Tabela');
    console.log(`"Neon Tabela" için ${hourlyTest.length} saatlik varyasyon üretildi:`);

    hourlyTest.forEach((variation, index) => {
      console.log(`\nSaat ${index + 1}: ${variation.metadata.style} + ${variation.metadata.colorScheme}`);
    });

    // Check database statistics
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 DATABASE İSTATİSTİKLERİ:\n');

    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM color_schemes WHERE is_active = true) as colors,
        (SELECT COUNT(*) FROM visual_elements WHERE is_active = true) as visuals,
        (SELECT COUNT(*) FROM style_presets WHERE is_active = true) as styles,
        (SELECT COUNT(*) FROM composition_rules WHERE is_active = true) as compositions,
        (SELECT COUNT(*) FROM recent_prompts) as recent_combinations
    `;

    const s = stats[0];
    console.log(`🎨 Aktif Renk Şemaları: ${s.colors}`);
    console.log(`🖼️ Aktif Görsel Elementler: ${s.visuals}`);
    console.log(`🎭 Aktif Stiller: ${s.styles}`);
    console.log(`📐 Aktif Kompozisyonlar: ${s.compositions}`);
    console.log(`🔄 Son 24 Saatteki Kombinasyonlar: ${s.recent_combinations}`);

    // Calculate possible combinations
    const possibleCombinations = parseInt(s.colors) * parseInt(s.styles) * parseInt(s.compositions);
    console.log(`\n💫 Olası Kombinasyon Sayısı: ${possibleCombinations.toLocaleString()}+`);
    console.log('   (Visual elements ve time variations dahil değil!)\n');

    console.log('✨ ÖZET:');
    console.log('• Her saat farklı kombinasyonlar');
    console.log('• Zaman bazlı ışık varyasyonları');
    console.log('• Tekrar etmeyen kombinasyonlar');
    console.log('• Weighted random selection');
    console.log('• Regional ve seasonal adaptasyon');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testDynamicPrompts();