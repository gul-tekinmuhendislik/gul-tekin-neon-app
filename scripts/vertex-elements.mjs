import { sql } from '../lib/db.ts';

async function checkVertexElements() {
  // Database'deki visual elements
  const dbElements = await sql`
    SELECT COUNT(DISTINCT name) as count,
           COUNT(DISTINCT topic_key) as topics,
           COUNT(DISTINCT element_type) as types
    FROM visual_elements
  `;

  console.log('📊 DATABASE VISUAL ELEMENTS DURUMU:\n');
  console.log(`✅ Toplam element: ${dbElements[0].count}`);
  console.log(`✅ Konu sayısı: ${dbElements[0].topics}`);
  console.log(`✅ Element tipi: ${dbElements[0].types} (concrete, abstract, technical)\n`);

  console.log('🎨 VERTEX AI / GÖRSEL ÜRETİMDE KULLANILABİLECEK VISUAL ELEMENTS:\n');

  const vertexElements = {
    'Objeler (14)': [
      'glass sphere', 'crystal prism', 'metal gears', 'circuit boards', 'LED lights',
      'holographic displays', 'fiber optic cables', 'solar panels', 'water droplets',
      'smoke particles', 'fire flames', 'ice crystals', 'lightning bolts', 'energy orbs'
    ],
    'Dokular (15)': [
      'brushed metal', 'carbon fiber', 'glass surface', 'water ripples', 'wood grain',
      'marble texture', 'concrete surface', 'fabric weave', 'leather pattern', 'rust texture',
      'chrome finish', 'matte surface', 'glossy coating', 'frosted glass', 'diamond pattern'
    ],
    'Efektler (15)': [
      'lens flare', 'bokeh effect', 'motion blur', 'depth of field', 'chromatic aberration',
      'glow effect', 'particle systems', 'light trails', 'reflection', 'refraction',
      'caustics', 'volumetric lighting', 'fog/mist', 'heat distortion', 'electromagnetic field'
    ],
    'Formlar (15)': [
      'geometric shapes', 'organic curves', 'fractal patterns', 'spiral forms', 'wave patterns',
      'grid layouts', 'hexagonal tiles', 'triangular mesh', 'circular rings', 'linear flows',
      'radial burst', 'zigzag patterns', 'dotted arrays', 'striped bands', 'gradient meshes'
    ],
    'Atmosfer (15)': [
      'dramatic lighting', 'ambient occlusion', 'rim lighting', 'backlighting', 'side lighting',
      'top-down lighting', 'studio lighting', 'natural sunlight', 'moonlight', 'neon glow',
      'underwater caustics', 'dusty atmosphere', 'foggy environment', 'clear sky', 'stormy weather'
    ],
    'Teknik (14)': [
      'wireframe models', 'blueprint lines', 'measurement indicators', 'arrows and pointers',
      'data visualizations', 'charts and graphs', 'flow diagrams', 'network nodes', 'connection lines',
      'status indicators', 'progress bars', 'gauge meters', 'digital displays', 'HUD elements'
    ],
    'Kompozisyon (15)': [
      'rule of thirds', 'golden ratio', 'symmetrical balance', 'asymmetrical balance', 'radial balance',
      'leading lines', 'framing elements', 'depth layers', 'focal points', 'negative space',
      'overlapping elements', 'size variation', 'color contrast', 'texture contrast', 'pattern repetition'
    ],
    'Renkler (15)': [
      'gradient transitions', 'color harmonies', 'complementary colors', 'analogous colors', 'triadic schemes',
      'monochromatic palettes', 'warm tones', 'cool tones', 'neon colors', 'pastel shades',
      'metallic finishes', 'iridescent effects', 'duotone filters', 'color overlays', 'tonal ranges'
    ]
  };

  let totalElements = 0;
  Object.keys(vertexElements).forEach(category => {
    const elements = vertexElements[category];
    console.log(`📁 ${category}:`);
    elements.forEach((elem, i) => {
      if (i < 3) console.log(`   • ${elem}`);
    });
    console.log(`   ... ve ${elements.length - 3} element daha\n`);
    totalElements += elements.length;
  });

  console.log(`📈 VERTEX AI TOPLAM: ${totalElements} visual element kullanılabilir`);

  console.log('\n💡 KARŞILAŞTIRMA:');
  console.log(`   Database: ${dbElements[0].count} element (3 konu için)`);
  console.log(`   Vertex AI: ${totalElements}+ element (sınırsız kombinasyon)`);

  console.log('\n🚀 ÖNERİ:');
  console.log('   • Database\'e daha fazla visual element eklenebilir');
  console.log('   • Her konu için özel elementler tanımlanabilir');
  console.log('   • Dinamik kombinasyonlar oluşturulabilir');
  console.log('   • Vertex AI elementleri prompt\'a dahil edilebilir');

  // Check style presets too
  const styles = await sql`SELECT COUNT(*) as count FROM style_presets`;
  console.log(`\n📊 Ek Bilgi: Database\'de ${styles[0].count} stil preset var`);

  process.exit(0);
}

checkVertexElements();