import { sql } from "../lib/db";

// Gelişmiş prompt template
const createAdvancedPrompt = (topic: string, keywords: string[] = []) => {
  const topicTemplates: Record<string, any> = {
    'Isı Pompası': {
      main: 'heat pump systems hero banner illustration',
      visual: 'copper coil spirals with frost and heat zones, compressor unit cutaway, refrigerant flow paths, evaporator-compressor-condenser cycle diagram',
      abstract: 'temperature gradient waves, hot/cold particle streams, infinity loop energy cycle',
      colors: 'gradient from warm orange #F97316 to cool blue #0284C7, neutral gray accents #94A3B8',
      atmosphere: 'thermal dynamics and energy efficiency'
    },
    'Su Arıtma': {
      main: 'water purification systems hero banner',
      visual: 'transparent filtration chambers with visible sediment layers, reverse osmosis membrane cross-section, 5-stage filter array',
      abstract: 'water molecules transforming from dark to crystal clear, flowing water ribbons through geometric filter shapes',
      colors: 'ocean blue gradient #0EA5E9 to crystal clear #E0F2FE, fresh green accents #10B981',
      atmosphere: 'clarity, purity, and technological precision'
    },
    'Sulama': {
      main: 'irrigation systems hero banner',
      visual: 'sprinkler heads in action, drip irrigation tubes, water distribution network, smart controller interfaces',
      abstract: 'water droplet patterns, agricultural field grids, efficiency flow diagrams',
      colors: 'earth tones with water blue #0EA5E9, vegetation green #10B981, soil brown #92400E',
      atmosphere: 'agricultural efficiency and water conservation'
    },
    'Su Depoları': {
      main: 'water storage tank systems illustration',
      visual: 'cylindrical steel tanks with level indicators, modular polyethylene tanks, underground concrete reservoirs',
      abstract: 'water volume visualization, pressure distribution patterns, storage capacity metrics',
      colors: 'industrial steel gray #475569 to water blue #0EA5E9, safety orange accents #EA580C',
      atmosphere: 'industrial reliability and storage capacity'
    },
    'Hidrofor': {
      main: 'water booster pump systems banner',
      visual: 'pressure tank cutaway showing bladder, pump impeller details, pressure gauge readings, control panel',
      abstract: 'hydraulic pressure waves, flow dynamics visualization, pressure boost curves',
      colors: 'mechanical blue #1E40AF to steel gray #64748B, pressure red indicators #DC2626',
      atmosphere: 'hydraulic power and pressure control'
    }
  };

  // Topic eşleştirme
  let template = null;
  for (const [key, value] of Object.entries(topicTemplates)) {
    if (topic.includes(key)) {
      template = value;
      break;
    }
  }

  // Default template
  if (!template) {
    template = {
      main: 'technical engineering systems illustration',
      visual: 'technical components in exploded view, control panels with LED indicators, system flow diagrams',
      abstract: 'energy flow patterns, geometric technical shapes, data visualization elements',
      colors: 'professional blue gradient #3B82F6 to #1E40AF, neutral gray accents #64748B',
      atmosphere: 'professional technology and innovation'
    };
  }

  // Bölgesel elementler
  const hasBodyrum = keywords.some(kw => kw.toLowerCase().includes('bodrum'));
  const hasMilas = keywords.some(kw => kw.toLowerCase().includes('milas'));
  const regional = hasBodyrum ? 
    ', subtle Mediterranean villa silhouettes in background, turquoise sea gradient hints' : 
    hasMilas ? 
    ', olive branch decorative patterns, terracotta color accents' : '';

  // Ana prompt
  const mainPrompt = `${template.main}, 16:9 aspect ratio (1920x1080), ${template.visual}, ${template.abstract}, ${template.colors}, modern editorial vector art style, flat design with subtle gradients and glass morphism effects, isometric technical elements mixed with organic flow, clean geometric shapes with smooth bezier curves, ${template.atmosphere}${regional}, professional digital art quality, ultra-detailed, high contrast for text overlay readability, scalable composition for responsive design`;

  // Negative prompt
  const negativePrompt = 'no text, no typography, no letters, no numbers, no logos, no human figures, no faces, no hands, no photorealistic elements, no photography, no cartoon style, no anime, no sketch, no pencil drawing, no cluttered composition, no busy patterns, no low contrast, no muddy colors, no oversaturation, no watermarks, no signatures';

  return {
    prompt: mainPrompt,
    negativePrompt: negativePrompt
  };
};

async function generateRemainingPrompts() {
  console.log('🎨 Kalan Kayıtlar İçin Prompt Oluşturma');
  console.log('=========================================\n');
  
  // Prompt'ı boş olan kayıtları getir
  const contents = await sql`
    SELECT id, topic, keywords
    FROM generated_content
    WHERE prompt IS NULL
    ORDER BY id
  `;
  
  console.log(`📊 ${contents.length} kayıt için prompt oluşturulacak\n`);
  
  let successCount = 0;
  
  for (const content of contents) {
    try {
      const { prompt, negativePrompt } = createAdvancedPrompt(content.topic, content.keywords || []);
      
      await sql`
        UPDATE generated_content
        SET 
          prompt = ${prompt},
          metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({
            promptGeneratedAt: new Date().toISOString(),
            promptGenerator: 'advanced-template',
            negativePrompt: negativePrompt,
            imageParameters: {
              width: 1920,
              height: 1080,
              quality: "high",
              stylePreset: "digital-art",
              cfgScale: 7.5,
              steps: 30
            }
          })}::jsonb,
          updated_at = NOW()
        WHERE id = ${content.id}
      `;
      
      successCount++;
      console.log(`✅ ID ${content.id}: ${content.topic}`);
      console.log(`   Prompt: ${prompt.substring(0, 100)}...`);
      
    } catch (error: any) {
      console.error(`❌ ID ${content.id} hatası:`, error.message);
    }
  }
  
  // Final durum
  console.log('\n📊 Final Durum:');
  console.log('===============');
  
  const finalStats = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE prompt IS NULL) as without_prompt,
      COUNT(*) FILTER (WHERE prompt IS NOT NULL) as with_prompt,
      COUNT(*) as total
    FROM generated_content
  `;
  
  console.log(`Toplam: ${finalStats[0].total} kayıt`);
  console.log(`Prompt'ı OLAN: ${finalStats[0].with_prompt} kayıt`);
  console.log(`Prompt'ı BOŞ: ${finalStats[0].without_prompt} kayıt`);
  console.log(`Bu işlemde oluşturulan: ${successCount} prompt`);
  
  console.log('\n✨ İşlem tamamlandı!');
}

generateRemainingPrompts()
  .then(() => {
    console.log('🎉 Tüm promptlar başarıyla oluşturuldu!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script hatası:', error);
    process.exit(1);
  });