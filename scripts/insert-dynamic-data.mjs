import { sql } from '../lib/db.ts';

async function insertDynamicData() {
  try {
    // Check if visual_elements has data
    const check = await sql`SELECT COUNT(*) as count FROM visual_elements`;
    console.log('Current visual_elements count:', check[0].count);

    if (check[0].count == 0) {
      console.log('Inserting visual elements...');

      // Insert visual elements
      await sql`
        INSERT INTO visual_elements (name, topic_key, element_type, description, weight) VALUES
        ('Crystal Filters', 'water_purification', 'concrete', 'transparent filtration chambers with visible sediment layers, reverse osmosis membrane cross-section', 150),
        ('Nano Filtration', 'water_purification', 'concrete', 'microscopic view of carbon nanotubes filtering water molecules, UV sterilization chamber glowing', 100),
        ('Water Flow', 'water_purification', 'abstract', 'flowing water ribbons through geometric filter shapes, droplet particles becoming diamonds', 120),
        ('Purification Waves', 'water_purification', 'abstract', 'wave patterns transforming from dark to crystal clear, spiral vortex of purification', 100),
        ('Technical Diagram', 'water_purification', 'technical', '5-stage filter array with pressure gauges and flow indicators', 100),
        ('Thermal Coils', 'heat_pump', 'concrete', 'copper coil spirals with frost and heat zones, compressor unit cutaway', 120),
        ('Energy Waves', 'heat_pump', 'abstract', 'temperature gradient waves, hot cold particle streams, infinity loop energy cycle', 110),
        ('Heat Diagram', 'heat_pump', 'technical', 'evaporator-compressor-condenser cycle diagram, COP efficiency visualization', 100),
        ('PV Grid', 'solar_panel', 'concrete', 'photovoltaic cell grid with sunlight rays, silicon wafers, inverter box with LED indicators', 130),
        ('Sun Energy', 'solar_panel', 'abstract', 'sun rays morphing into electrical circuits, energy particles flowing through panel matrix', 120),
        ('Solar Tech', 'solar_panel', 'technical', 'monocrystalline cell structure, DC to AC conversion flow, efficiency percentage meter', 100)
      `;
      console.log('✅ Visual elements inserted');
    }

    // Check composition rules
    const compCheck = await sql`SELECT COUNT(*) as count FROM composition_rules`;
    if (compCheck[0].count == 0) {
      console.log('Inserting composition rules...');
      await sql`
        INSERT INTO composition_rules (name, layout_type, layout_description, focal_point, spacing_rules, depth_layers, margin_rules) VALUES
        ('Golden Ratio', 'asymmetrical', '60/40 visual weight distribution', 'primary element at golden ratio intersection (left third)', '30% negative space on right for headlines', '3-layer depth: background, main, foreground', '10% safe area from edges'),
        ('Rule of Thirds', 'grid-based', 'elements aligned to thirds grid', 'main subject on intersection points', 'balanced spacing between elements', 'foreground midground background separation', '15% margins for flexibility'),
        ('Central Hero', 'symmetrical', 'centered composition with radial balance', 'strong central focal point', '20% breathing room around center', 'radial depth from center outward', '5% minimal margins'),
        ('Dynamic Diagonal', 'diagonal', 'diagonal flow from bottom-left to top-right', 'key element along diagonal line', 'dynamic tension through diagonal placement', 'overlapping depth layers', '12% adaptive margins')
      `;
      console.log('✅ Composition rules inserted');
    }

    // Check style presets
    const styleCheck = await sql`SELECT COUNT(*) as count FROM style_presets`;
    if (styleCheck[0].count == 0) {
      console.log('Inserting style presets...');

      const neonModernEffects = JSON.stringify(["glass morphism", "neon glow", "subtle gradients"]);
      const cyberpunkEffects = JSON.stringify(["holographic shimmer", "glitch effects", "neon outlines"]);
      const minimalEffects = JSON.stringify(["soft shadows", "clean lines", "subtle animations"]);
      const retroEffects = JSON.stringify(["synthwave gradients", "retro grid", "neon trails"]);

      await sql`
        INSERT INTO style_presets (name, category, main_style, effects, render_style, atmosphere, technical_specs) VALUES
        ('Neon Modern', 'modern', 'Modern editorial vector illustration with neon accents', ${neonModernEffects}::jsonb, 'flat design with depth', 'professional yet vibrant, conveying innovation', 'high contrast for text overlay, scalable vectors'),
        ('Cyberpunk Tech', 'futuristic', 'Cyberpunk aesthetic with holographic elements', ${cyberpunkEffects}::jsonb, 'dark with bright accents', 'high-tech dystopian with electric energy', 'HDR lighting, chromatic aberration touches'),
        ('Clean Minimal', 'modern', 'Minimalist design with focus on clarity', ${minimalEffects}::jsonb, 'ultra-clean vectors', 'serene and professional, trustworthy', 'maximum readability, mobile-optimized'),
        ('Retro Neon', 'retro', '80s inspired retrowave aesthetic', ${retroEffects}::jsonb, 'nostalgic neon style', 'nostalgic yet modern, energetic vibes', 'vintage color palettes with modern rendering')
      `;
      console.log('✅ Style presets inserted');
    }

    // Check regional themes
    const regionalCheck = await sql`SELECT COUNT(*) as count FROM regional_themes`;
    if (regionalCheck[0].count == 0) {
      console.log('Inserting regional themes...');

      const bodrumKeywords = JSON.stringify(["bodrum", "muğla", "ege"]);
      const milasKeywords = JSON.stringify(["milas", "söke", "didim"]);
      const industrialKeywords = JSON.stringify(["sanayi", "osb", "fabrika"]);

      const bodrumSeasons = JSON.stringify({summer: "bright sunny atmosphere", winter: "calm seas and clear skies"});
      const milasSeasons = JSON.stringify({harvest: "golden wheat fields", spring: "olive blossoms"});
      const industrialSeasons = JSON.stringify({day: "busy productive atmosphere", night: "illuminated facilities"});

      await sql`
        INSERT INTO regional_themes (region_name, region_key, visual_elements, cultural_motifs, seasonal_variants, keywords) VALUES
        ('Bodrum', 'bodrum', 'Mediterranean villa silhouettes, yacht marina hints, turquoise sea gradients', 'white cubic architecture, bougainvillea accents, windmill shapes', ${bodrumSeasons}::jsonb, ${bodrumKeywords}::jsonb),
        ('Milas', 'milas', 'olive tree branches, ancient stone patterns, rural landscape hints', 'traditional carpet motifs, terracotta accents, agricultural elements', ${milasSeasons}::jsonb, ${milasKeywords}::jsonb),
        ('Industrial Zone', 'industrial', 'factory silhouettes, warehouse structures, logistics elements', 'warning stripes, safety symbols, industrial equipment', ${industrialSeasons}::jsonb, ${industrialKeywords}::jsonb)
      `;
      console.log('✅ Regional themes inserted');
    }

    // Check negative prompts
    const negativeCheck = await sql`SELECT COUNT(*) as count FROM negative_prompts`;
    if (negativeCheck[0].count == 0) {
      console.log('Inserting negative prompts...');
      await sql`
        INSERT INTO negative_prompts (category, prompt_text, severity) VALUES
        ('quality', 'no low quality, no pixelated, no blurry, no artifacts, no compression', 3),
        ('content', 'no text, no typography, no letters, no numbers, no logos, no watermarks', 3),
        ('style', 'no photorealistic, no cartoon, no anime, no sketch, no hand-drawn', 2),
        ('people', 'no human figures, no faces, no hands, no body parts', 2),
        ('composition', 'no cluttered, no busy patterns, no chaotic layout, no overlapping text areas', 2),
        ('color', 'no muddy colors, no oversaturation, no low contrast, no color bleeding', 1),
        ('generic', 'no stock photo aesthetics, no generic clip art, no cliché imagery', 1)
      `;
      console.log('✅ Negative prompts inserted');
    }

    // Final count
    const final = await sql`
      SELECT
        (SELECT COUNT(*) FROM visual_elements) as visual,
        (SELECT COUNT(*) FROM composition_rules) as comp,
        (SELECT COUNT(*) FROM style_presets) as style,
        (SELECT COUNT(*) FROM regional_themes) as regional,
        (SELECT COUNT(*) FROM negative_prompts) as negative
    `;

    console.log('\n📊 Final counts:');
    console.log('Visual Elements:', final[0].visual);
    console.log('Composition Rules:', final[0].comp);
    console.log('Style Presets:', final[0].style);
    console.log('Regional Themes:', final[0].regional);
    console.log('Negative Prompts:', final[0].negative);

    console.log('\n🎉 All dynamic data inserted successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

insertDynamicData();