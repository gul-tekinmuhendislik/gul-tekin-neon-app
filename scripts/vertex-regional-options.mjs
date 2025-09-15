console.log('🌍 VERTEX AI İÇİN REGIONAL THEMES (BÖLGESEL TEMALAR):\n');
console.log('='.repeat(70));

const regionalThemes = {
  'TÜRKİYE BÖLGELERİ': {
    'Ege Bölgesi': {
      elements: 'olive trees, whitewashed buildings, blue shutters, bougainvillea, windmills, yacht harbors',
      colors: 'turquoise, white, terracotta, olive green, sunset orange',
      atmosphere: 'Mediterranean warmth, coastal breeze, relaxed lifestyle'
    },
    'Akdeniz': {
      elements: 'citrus groves, ancient ruins, pine forests, turquoise coast, traditional boats',
      colors: 'azure blue, sun yellow, limestone white, pine green',
      atmosphere: 'sunny, vibrant, historical richness'
    },
    'Karadeniz': {
      elements: 'tea plantations, wooden houses, misty mountains, hazelnut trees, steep valleys',
      colors: 'deep green, foggy grey, wood brown, mountain blue',
      atmosphere: 'misty, lush, traditional'
    },
    'İç Anadolu': {
      elements: 'wheat fields, fairy chimneys, vast steppes, traditional stone houses',
      colors: 'golden wheat, earth tones, sky blue, sandstone',
      atmosphere: 'continental, spacious, historic'
    },
    'Marmara': {
      elements: 'industrial zones, bridges, urban skyline, sea of marmara, historical peninsula',
      colors: 'urban grey, sea blue, modern metallics, historic gold',
      atmosphere: 'metropolitan, dynamic, blend of old and new'
    },
    'Doğu Anadolu': {
      elements: 'snow-capped mountains, volcanic landscapes, ancient fortresses, traditional villages',
      colors: 'snow white, volcanic black, mountain grey, sunrise red',
      atmosphere: 'rugged, majestic, traditional'
    },
    'Güneydoğu Anadolu': {
      elements: 'historical stone architecture, desert landscapes, ancient cities, traditional bazaars',
      colors: 'sandstone yellow, desert orange, deep shadows, copper tones',
      atmosphere: 'historic, warm, mystical'
    }
  },

  'DÜNYA BÖLGELERİ': {
    'Mediterranean': {
      elements: 'coastal cliffs, terracotta roofs, olive groves, azure waters, fishing boats',
      colors: 'mediterranean blue, terracotta, olive green, limestone white',
      atmosphere: 'warm, sunny, relaxed coastal life'
    },
    'Nordic': {
      elements: 'fjords, northern lights, pine forests, minimalist architecture, snow landscapes',
      colors: 'ice blue, aurora green, midnight blue, pure white',
      atmosphere: 'cold, clean, minimalist'
    },
    'Tropical': {
      elements: 'palm trees, beaches, coral reefs, rainforest, exotic flowers',
      colors: 'vibrant green, ocean turquoise, sunset orange, tropical pink',
      atmosphere: 'humid, lush, vibrant'
    },
    'Desert': {
      elements: 'sand dunes, oases, cacti, rock formations, mirages',
      colors: 'sand yellow, sky blue, sunset red, shadow purple',
      atmosphere: 'hot, dry, vast'
    },
    'Alpine': {
      elements: 'mountain peaks, ski slopes, chalets, pine forests, mountain lakes',
      colors: 'snow white, pine green, sky blue, rock grey',
      atmosphere: 'crisp, fresh, majestic'
    },
    'Urban Metropolis': {
      elements: 'skyscrapers, neon signs, traffic, modern architecture, city lights',
      colors: 'neon colors, concrete grey, glass blue, night black',
      atmosphere: 'busy, modern, electric'
    },
    'Rural Countryside': {
      elements: 'farmlands, barns, windmills, country roads, traditional houses',
      colors: 'field green, barn red, sky blue, earth brown',
      atmosphere: 'peaceful, traditional, natural'
    },
    'Coastal': {
      elements: 'beaches, lighthouses, fishing ports, seabirds, coastal rocks',
      colors: 'ocean blue, sand beige, seafoam green, sunset orange',
      atmosphere: 'breezy, fresh, maritime'
    },
    'Industrial': {
      elements: 'factories, warehouses, machinery, pipes, steel structures',
      colors: 'steel grey, rust orange, warning yellow, industrial blue',
      atmosphere: 'mechanical, powerful, structured'
    }
  },

  'ÖZEL LOKASYONLAR': {
    'Bodrum': {
      elements: 'white cubic houses, blue doors, yacht marina, castle, bougainvillea',
      colors: 'Bodrum white, aegean blue, bougainvillea pink',
      atmosphere: 'luxury coastal, artistic, nightlife'
    },
    'Milas': {
      elements: 'olive groves, carpet patterns, ancient stones, rural landscapes',
      colors: 'olive green, terracotta, stone grey, earth tones',
      atmosphere: 'traditional, agricultural, historical'
    },
    'İstanbul': {
      elements: 'bosphorus, historical skyline, modern towers, bridges, ferries',
      colors: 'bosphorus blue, ottoman gold, modern grey',
      atmosphere: 'cosmopolitan, historic, dynamic'
    },
    'Antalya': {
      elements: 'turquoise coast, waterfalls, ancient ruins, resort hotels',
      colors: 'turquoise, white, green, sunset gold',
      atmosphere: 'touristic, sunny, ancient meets modern'
    },
    'Kapadokya': {
      elements: 'fairy chimneys, hot air balloons, cave hotels, volcanic rocks',
      colors: 'rose valley pink, volcanic grey, sunrise orange',
      atmosphere: 'mystical, unique, otherworldly'
    }
  },

  'MEVSİMSEL TEMALAR': {
    'Spring': {
      elements: 'blooming flowers, fresh leaves, rain showers, butterflies',
      colors: 'fresh green, pastel pink, sky blue, yellow',
      atmosphere: 'renewal, fresh, vibrant'
    },
    'Summer': {
      elements: 'bright sun, beaches, clear skies, vacation vibes',
      colors: 'bright blue, sun yellow, vibrant green, warm orange',
      atmosphere: 'hot, energetic, vacation'
    },
    'Autumn': {
      elements: 'falling leaves, harvest, golden light, cozy scenes',
      colors: 'orange, red, yellow, brown, golden',
      atmosphere: 'cozy, warm, nostalgic'
    },
    'Winter': {
      elements: 'snow, frost, fireplaces, winter sports, holidays',
      colors: 'white, ice blue, grey, warm indoor lights',
      atmosphere: 'cold, cozy indoors, festive'
    }
  }
};

// Display all regional themes
Object.keys(regionalThemes).forEach(category => {
  console.log(`\n📍 ${category}:\n`);
  const themes = regionalThemes[category];

  Object.keys(themes).forEach(region => {
    const theme = themes[region];
    console.log(`  🏷️ ${region}`);
    console.log(`     Elements: ${theme.elements.substring(0, 60)}...`);
    console.log(`     Colors: ${theme.colors}`);
    console.log(`     Atmosphere: ${theme.atmosphere}`);
    console.log('');
  });
});

console.log('='.repeat(70));
console.log('\n📊 ÖZET:');
console.log(`• ${Object.keys(regionalThemes).length} ana kategori`);
console.log(`• Toplam ${Object.values(regionalThemes).reduce((acc, cat) => acc + Object.keys(cat).length, 0)} bölgesel tema`);
console.log('• Her tema: elements + colors + atmosphere içeriyor');

console.log('\n💡 KULLANIM ÖRNEĞİ:');
console.log('Prompt: "Bodrum style Mediterranean villa with white cubic houses..."');
console.log('Otomatik eklenecek: turquoise sea, bougainvillea, yacht marina elementi');

console.log('\n🚀 DATABASE\'E EKLEMEK İÇİN:');
console.log('Bu temalar regional_themes tablosuna eklenebilir');
console.log('Keywords bazlı otomatik tema seçimi yapılabilir');

process.exit(0);