import { sql } from '../lib/db.ts';

async function setupColorSchemes() {
  try {
    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS color_schemes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        topic_key VARCHAR(100),
        primary_gradient JSONB NOT NULL,
        accent_colors JSONB,
        emotion_description TEXT,
        is_active BOOLEAN DEFAULT true,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Table created');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_color_schemes_topic_key ON color_schemes(topic_key)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_color_schemes_is_active ON color_schemes(is_active)`;
    console.log('✅ Indexes created');

    // Check if data exists
    const existing = await sql`SELECT COUNT(*) as count FROM color_schemes`;
    if (existing[0].count > 0) {
      console.log(`ℹ️ Table already has ${existing[0].count} color schemes`);
      return;
    }

    // Insert color schemes
    const colorSchemes = [
      {
        name: 'Neon Aqua',
        topic_key: 'water_purification',
        primary_gradient: ["#00FFFF", "#0EA5E9", "#006FFF", "#0033CC"],
        accent_colors: ["#10F4B1", "#00D4FF"],
        emotion_description: 'Evoking crystal clarity with electric cyan and deep ocean blues'
      },
      {
        name: 'Thermal Neon',
        topic_key: 'heat_pump',
        primary_gradient: ["#FF6B00", "#FF3366", "#0088FF", "#00CCFF"],
        accent_colors: ["#FF00FF", "#FFAA00"],
        emotion_description: 'Dynamic thermal contrast with hot orange and cool blue neons'
      },
      {
        name: 'Solar Electric',
        topic_key: 'solar_panel',
        primary_gradient: ["#FFFF00", "#FFD700", "#9933FF", "#6600FF"],
        accent_colors: ["#00FF00", "#FF00AA"],
        emotion_description: 'Vibrant solar energy with electric yellow and purple plasma'
      },
      {
        name: 'Classic Neon',
        topic_key: 'neon_signage',
        primary_gradient: ["#FF10F0", "#FF00AA", "#AA00FF", "#7700FF"],
        accent_colors: ["#00FFAA", "#FFAA00"],
        emotion_description: 'Iconic neon glow with hot pink and electric purple'
      },
      {
        name: 'RGB Spectrum',
        topic_key: 'led_display',
        primary_gradient: ["#FF0000", "#00FF00", "#0000FF", "#FF00FF"],
        accent_colors: ["#00FFFF", "#FFFF00"],
        emotion_description: 'Full RGB spectrum representing digital display technology'
      },
      {
        name: 'Arctic Neon',
        topic_key: 'air_conditioning',
        primary_gradient: ["#00FFCC", "#00CCFF", "#0099FF", "#0066FF"],
        accent_colors: ["#00FF99", "#99FFFF"],
        emotion_description: 'Refreshing arctic tones with mint and ice blue neons'
      },
      {
        name: 'Thermal Glow',
        topic_key: 'underfloor_heating',
        primary_gradient: ["#FF3300", "#FF6600", "#FF9900", "#FFCC00"],
        accent_colors: ["#FF0066", "#FFFF33"],
        emotion_description: 'Warm radiant heat with glowing orange and red tones'
      },
      {
        name: 'Pressure Wave',
        topic_key: 'water_booster',
        primary_gradient: ["#00FF66", "#00CCFF", "#0099CC", "#006699"],
        accent_colors: ["#33FF99", "#66FFFF"],
        emotion_description: 'High-pressure dynamics with aqua green and ocean blue'
      },
      {
        name: 'Tech Neon Default',
        topic_key: 'default',
        primary_gradient: ["#00D4FF", "#FF00D4", "#D4FF00", "#FF7700"],
        accent_colors: ["#00FF88", "#8800FF"],
        emotion_description: 'Universal tech aesthetic with balanced neon spectrum'
      },
      {
        name: 'Bodrum Neon',
        topic_key: 'bodrum_special',
        primary_gradient: ["#00E5FF", "#00B4D8", "#FF6B9D", "#FFC75F"],
        accent_colors: ["#95E1D3", "#F38181"],
        emotion_description: 'Mediterranean vibes with turquoise sea and sunset neons'
      }
    ];

    for (const scheme of colorSchemes) {
      await sql`
        INSERT INTO color_schemes (name, topic_key, primary_gradient, accent_colors, emotion_description)
        VALUES (
          ${scheme.name},
          ${scheme.topic_key},
          ${JSON.stringify(scheme.primary_gradient)}::jsonb,
          ${JSON.stringify(scheme.accent_colors)}::jsonb,
          ${scheme.emotion_description}
        )
      `;
    }

    console.log(`✅ Inserted ${colorSchemes.length} color schemes`);

    // Verify
    const verify = await sql`SELECT name, topic_key FROM color_schemes ORDER BY id`;
    console.log('\n📊 Color schemes in database:');
    verify.forEach(v => console.log(`  - ${v.name} (${v.topic_key})`));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

setupColorSchemes();