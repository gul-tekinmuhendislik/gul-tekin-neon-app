import { sql } from '../lib/db.ts';

async function checkRemainingParams() {
  console.log('📊 MEVCUT DİNAMİK TABLOLAR VE KAYIT SAYILARI:\n');
  console.log('='.repeat(60));

  const tables = [
    { name: 'color_schemes', desc: 'Renk şemaları' },
    { name: 'visual_elements', desc: 'Görsel elementler' },
    { name: 'composition_rules', desc: 'Kompozisyon kuralları' },
    { name: 'style_presets', desc: 'Stil ayarları' },
    { name: 'regional_themes', desc: 'Bölgesel temalar' },
    { name: 'negative_prompts', desc: 'Negatif promptlar' },
    { name: 'prompt_templates', desc: 'Prompt şablonları' }
  ];

  let totalRecords = 0;
  for (const table of tables) {
    try {
      const result = await sql.unsafe(`SELECT COUNT(*) as count FROM ${table.name}`);
      const count = result[0].count;
      totalRecords += parseInt(count);
      const status = count > 0 ? '✅' : '❌';
      console.log(`${status} ${table.name.padEnd(20)} | ${table.desc.padEnd(25)} | ${count} kayıt`);
    } catch (err) {
      console.log(`❌ ${table.name.padEnd(20)} | ${table.desc.padEnd(25)} | Tablo yok`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`TOPLAM: ${totalRecords} kayıt (7 tablo)\n`);

  console.log('🎯 EKLENEBİLECEK YENİ PARAMETRE TABLOLARI:\n');

  const suggestions = [
    {
      table: '1. aspect_ratios',
      desc: 'Görsel boyut oranları',
      examples: '16:9 (1920x1080), 1:1 (1024x1024), 9:16 (1080x1920)',
      benefit: 'Farklı platform gereksinimleri için otomatik boyutlandırma'
    },
    {
      table: '2. quality_settings',
      desc: 'Kalite ve render ayarları',
      examples: 'steps: 10-150, cfg_scale: 1-30, sampler: K_EULER',
      benefit: 'Hız vs kalite dengesini optimize etme'
    },
    {
      table: '3. camera_angles',
      desc: 'Kamera açıları',
      examples: 'bird eye view, eye level, low angle, close-up, wide',
      benefit: 'Perspektif çeşitliliği ve dinamizm'
    },
    {
      table: '4. lighting_setups',
      desc: 'Aydınlatma düzenleri',
      examples: 'golden hour, studio, neon glow, moonlight, dramatic',
      benefit: 'Atmosfer ve mood kontrolü'
    },
    {
      table: '5. mood_atmospheres',
      desc: 'Ruh hali/atmosfer',
      examples: 'professional, energetic, calm, mysterious, vibrant',
      benefit: 'Duygusal ton ayarlama'
    },
    {
      table: '6. material_textures',
      desc: 'Malzeme ve dokular',
      examples: 'brushed metal, glass, carbon fiber, concrete, wood',
      benefit: 'Gerçekçi malzeme görünümleri'
    },
    {
      table: '7. motion_states',
      desc: 'Hareket durumları',
      examples: 'static, flowing, rotating, pulsing, exploding',
      benefit: 'Dinamik görsel efektler'
    },
    {
      table: '8. time_of_day',
      desc: 'Gün zamanları',
      examples: 'dawn, morning, noon, sunset, night, blue hour',
      benefit: 'Zamansal atmosfer'
    },
    {
      table: '9. weather_conditions',
      desc: 'Hava durumları',
      examples: 'sunny, cloudy, rainy, foggy, stormy, snowy',
      benefit: 'Çevresel koşul simülasyonu'
    },
    {
      table: '10. industry_keywords',
      desc: 'Sektörel anahtar kelimeler',
      examples: 'HVAC, plumbing, solar, electrical, construction',
      benefit: 'Sektöre özel içerik optimizasyonu'
    }
  ];

  suggestions.forEach(s => {
    console.log(`📁 ${s.table}`);
    console.log(`   📝 Açıklama: ${s.desc}`);
    console.log(`   📌 Örnekler: ${s.examples}`);
    console.log(`   ✨ Fayda: ${s.benefit}`);
    console.log('');
  });

  console.log('💡 ÖZET:\n');
  console.log('✅ Tamamlanan:');
  console.log('   • Renk sistemleri (color_schemes)');
  console.log('   • Görsel elementler (visual_elements) - genişletildi');
  console.log('   • Stiller (style_presets) - 42 stil eklendi');
  console.log('   • Kompozisyon kuralları (composition_rules)');
  console.log('   • Bölgesel temalar (regional_themes)');
  console.log('   • Negatif promptlar (negative_prompts)');

  console.log('\n🚀 Öncelikli eklenebilecekler:');
  console.log('   1. aspect_ratios - Farklı platform ihtiyaçları için');
  console.log('   2. quality_settings - Performans optimizasyonu için');
  console.log('   3. lighting_setups - Atmosfer kontrolü için');

  process.exit(0);
}

checkRemainingParams();