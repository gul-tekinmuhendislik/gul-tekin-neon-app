import { sql } from '../lib/db.ts';

async function listVertexStyles() {
  // Check current style presets in database
  const styles = await sql`
    SELECT name, category, main_style, render_style
    FROM style_presets
    ORDER BY category, name
  `;

  console.log('📊 MEVCUT STİL PRESETS (Database):\n');
  console.log('Kategori | İsim            | Ana Stil');
  console.log('---------|-----------------|----------');

  styles.forEach(s => {
    const cat = s.category?.padEnd(8) || '-';
    const name = s.name.padEnd(15);
    const style = s.main_style.substring(0, 40) + '...';
    console.log(`${cat} | ${name} | ${style}`);
  });

  console.log('\n✨ VERTEX AI / GÖRSEL ÜRETİM STİLLERİ:\n');

  const vertexStyles = [
    // Realistic
    { category: 'realistic', name: 'Photorealistic', description: 'Fotoğraf gerçekliğinde görüntüler' },
    { category: 'realistic', name: 'Hyperrealistic', description: 'Ultra detaylı gerçekçi render' },
    { category: 'realistic', name: 'Professional Photo', description: 'Profesyonel fotoğraf stili' },

    // Illustration
    { category: 'illustration', name: 'Digital Illustration', description: 'Dijital illüstrasyon stili' },
    { category: 'illustration', name: 'Vector Art', description: 'Vektörel sanat stili' },
    { category: 'illustration', name: 'Flat Design', description: 'Düz tasarım, minimal gölgeler' },
    { category: 'illustration', name: 'Isometric', description: 'İzometrik 3D görünüm' },
    { category: 'illustration', name: 'Line Art', description: 'Çizgi sanatı' },

    // Artistic
    { category: 'artistic', name: 'Oil Painting', description: 'Yağlı boya tarzı' },
    { category: 'artistic', name: 'Watercolor', description: 'Sulu boya efekti' },
    { category: 'artistic', name: 'Pencil Sketch', description: 'Kalem eskiz stili' },
    { category: 'artistic', name: 'Ink Drawing', description: 'Mürekkep çizim' },
    { category: 'artistic', name: 'Pastel Art', description: 'Pastel boya stili' },
    { category: 'artistic', name: 'Charcoal', description: 'Kömür kalem çizim' },

    // 3D
    { category: '3d', name: '3D Render', description: 'Profesyonel 3D render' },
    { category: '3d', name: 'Clay Render', description: 'Kil/clay 3D görünüm' },
    { category: '3d', name: 'Low Poly', description: 'Düşük poligon 3D stil' },
    { category: '3d', name: 'Voxel Art', description: 'Voxel 3D sanat' },

    // Anime/Manga
    { category: 'anime', name: 'Anime Style', description: 'Japon anime stili' },
    { category: 'anime', name: 'Manga', description: 'Manga çizim stili' },
    { category: 'anime', name: 'Chibi', description: 'Sevimli chibi karakterler' },
    { category: 'anime', name: 'Studio Ghibli', description: 'Studio Ghibli film stili' },

    // Retro
    { category: 'retro', name: 'Pixel Art', description: '8-bit piksel sanatı' },
    { category: 'retro', name: 'Synthwave', description: '80ler retrowave' },
    { category: 'retro', name: 'Vintage Poster', description: 'Vintage poster stili' },
    { category: 'retro', name: 'Art Deco', description: 'Art Deco stili' },
    { category: 'retro', name: 'Pop Art', description: 'Pop art stili' },

    // Modern
    { category: 'modern', name: 'Minimalist', description: 'Minimalist tasarım' },
    { category: 'modern', name: 'Abstract', description: 'Soyut sanat' },
    { category: 'modern', name: 'Geometric', description: 'Geometrik formlar' },
    { category: 'modern', name: 'Gradient Mesh', description: 'Gradyan mesh efekti' },
    { category: 'modern', name: 'Glassmorphism', description: 'Cam efekti tasarım' },
    { category: 'modern', name: 'Neumorphism', description: 'Soft UI tasarım' },

    // Technical
    { category: 'technical', name: 'Blueprint', description: 'Teknik blueprint çizim' },
    { category: 'technical', name: 'CAD Drawing', description: 'CAD teknik çizim' },
    { category: 'technical', name: 'Infographic', description: 'İnfografik stil' },
    { category: 'technical', name: 'Diagram', description: 'Diyagram ve şema' },
    { category: 'technical', name: 'Schematic', description: 'Elektronik şema' }
  ];

  // Group by category
  const categories = {};
  vertexStyles.forEach(style => {
    if (!categories[style.category]) {
      categories[style.category] = [];
    }
    categories[style.category].push(style);
  });

  // Display by category
  Object.keys(categories).forEach(cat => {
    console.log(`\n🎨 ${cat.toUpperCase()} (${categories[cat].length} stil):`);
    categories[cat].forEach((s, i) => {
      console.log(`   ${i+1}. ${s.name} - ${s.description}`);
    });
  });

  console.log(`\n📈 TOPLAM: ${vertexStyles.length} farklı stil kullanılabilir`);
  console.log('\n💡 Vertex AI Desteklenen Stil Parametreleri:');
  console.log('   - stylePreset: digital-art, enhance, photographic, anime, etc.');
  console.log('   - sampler: K_EULER, K_EULER_ANCESTRAL, K_DPM_2, K_DPM_2_ANCESTRAL');
  console.log('   - cfgScale: 1-30 arası (7-12 önerilen)');
  console.log('   - steps: 10-150 arası (30-50 önerilen)');

  console.log('\n🔧 Database\'e eklemek için: npx tsx scripts/add-more-styles.mjs');

  process.exit(0);
}

listVertexStyles();