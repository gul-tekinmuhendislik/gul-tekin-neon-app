import { sql } from '../lib/db.ts';

async function testCompositionRandomization() {
  console.log('🎨 COMPOSITION RULES RANDOMIZATION TEST\n');
  console.log('='.repeat(70));

  // Test 20 random selections
  console.log('\n📊 20 RASTGELE SEÇİM TESTİ:\n');

  const selections = {};
  const categories = {};

  for (let i = 0; i < 20; i++) {
    // Get random composition with weight consideration
    const result = await sql`
      SELECT name, category, weight, layout_type
      FROM composition_rules
      WHERE is_active = true
      ORDER BY RANDOM() * (1.0 / NULLIF(weight, 0))
      LIMIT 1
    `;

    const comp = result[0];

    // Track selections
    selections[comp.name] = (selections[comp.name] || 0) + 1;
    categories[comp.category] = (categories[comp.category] || 0) + 1;

    console.log(`${(i+1).toString().padStart(2)}. ${comp.name.padEnd(25)} | ${comp.category?.padEnd(12)} | Weight: ${comp.weight}`);
  }

  console.log('\n📈 SEÇİM İSTATİSTİKLERİ:');
  console.log('-'.repeat(50));

  // Show category distribution
  console.log('\nKategori Dağılımı:');
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const percentage = (count / 20 * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(count));
      console.log(`${cat?.padEnd(15)} ${bar.padEnd(10)} ${count} (${percentage}%)`);
    });

  // Show most selected
  console.log('\nEn Çok Seçilenler:');
  Object.entries(selections)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([name, count]) => {
      if (count > 1) {
        console.log(`  • ${name}: ${count} kez`);
      }
    });

  // Test hourly variation
  console.log('\n' + '='.repeat(70));
  console.log('\n⏰ SAATLİK VARYASYON SİMÜLASYONU:\n');

  const hours = [6, 12, 18, 23];

  for (const hour of hours) {
    // Simulate different moods based on time
    let categoryFilter = '';

    if (hour >= 6 && hour < 12) {
      categoryFilter = "AND category IN ('classic', 'balanced')";
    } else if (hour >= 12 && hour < 18) {
      categoryFilter = "AND category IN ('dynamic', 'structured')";
    } else if (hour >= 18 && hour < 23) {
      categoryFilter = "AND category IN ('artistic', 'cinematic')";
    } else {
      categoryFilter = "AND category IN ('experimental', 'dynamic')";
    }

    const result = await sql.unsafe(`
      SELECT name, category, layout_description
      FROM composition_rules
      WHERE is_active = true
      ${categoryFilter}
      ORDER BY RANDOM() * (1.0 / NULLIF(weight, 0))
      LIMIT 1
    `);

    const comp = result[0];
    console.log(`Saat ${hour.toString().padStart(2)}:00 → ${comp.name.padEnd(25)} (${comp.category})`);
    console.log(`         ${comp.layout_description?.substring(0, 60)}...`);
    console.log('');
  }

  // Update use counts
  console.log('='.repeat(70));
  console.log('\n📊 KULLANIM SAYACI GÜNCELLENİYOR...\n');

  // Increment use counts for selected compositions
  for (const [name, count] of Object.entries(selections)) {
    await sql`
      UPDATE composition_rules
      SET use_count = use_count + ${count}
      WHERE name = ${name}
    `;
  }

  // Show most used compositions overall
  const mostUsed = await sql`
    SELECT name, category, use_count, weight
    FROM composition_rules
    WHERE use_count > 0
    ORDER BY use_count DESC
    LIMIT 10
  `;

  console.log('En Çok Kullanılan Kompozisyonlar:');
  mostUsed.forEach((comp, i) => {
    console.log(`${i+1}. ${comp.name.padEnd(25)} | Kullanım: ${comp.use_count} | Ağırlık: ${comp.weight}`);
  });

  console.log('\n✨ ÖZET:');
  console.log('• 34 farklı kompozisyon kuralı');
  console.log('• 7 kategori (classic, dynamic, balanced, vb.)');
  console.log('• Ağırlık bazlı rastgele seçim');
  console.log('• Zaman bazlı kategori tercihi');
  console.log('• Kullanım takibi ile optimizasyon');

  process.exit(0);
}

testCompositionRandomization();