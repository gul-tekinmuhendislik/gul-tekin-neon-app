import { sql } from '../lib/db';

interface TitleAnalysis {
  meta_title: string;
  title: string;
  topic: string;
  count?: number;
}

async function analyzeSEOTitles() {
  try {
    console.log('🔍 SEO Title Analysis for Generated Content\n');
    console.log('=' .repeat(80));

    // 1. Get all content with titles
    const allContent = await sql<TitleAnalysis[]>`
      SELECT meta_title, title, topic
      FROM generated_content
      WHERE meta_title IS NOT NULL
      ORDER BY meta_title, topic
    `;
    
    console.log(`\n📊 Total content pieces: ${allContent.length}`);

    // 2. Find duplicate meta_titles
    const duplicateTitles = await sql<TitleAnalysis[]>`
      SELECT 
        meta_title, 
        COUNT(*) as count,
        STRING_AGG(DISTINCT topic, ', ') as topics
      FROM generated_content
      WHERE meta_title IS NOT NULL
      GROUP BY meta_title
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC, meta_title
    `;

    if (duplicateTitles.length > 0) {
      console.log('\n❌ DUPLICATE META TITLES FOUND:');
      console.log('-'.repeat(80));
      duplicateTitles.forEach((item: any) => {
        console.log(`\n  Title: "${item.meta_title}"`);
        console.log(`  Appears: ${item.count} times`);
        console.log(`  Topics: ${item.topics}`);
      });
    } else {
      console.log('\n✅ No duplicate meta titles found');
    }

    // 3. Analyze title patterns
    console.log('\n📝 TITLE PATTERN ANALYSIS:');
    console.log('-'.repeat(80));

    // Check for "Su Arıtma Sistemleri" pattern specifically
    const waterTreatmentTitles = await sql<TitleAnalysis[]>`
      SELECT meta_title, title, topic
      FROM generated_content
      WHERE meta_title LIKE '%Su Arıtma%'
      ORDER BY meta_title
    `;

    if (waterTreatmentTitles.length > 0) {
      console.log(`\n🔍 "Su Arıtma" related titles: ${waterTreatmentTitles.length} found`);
      const uniqueWaterTitles = new Set(waterTreatmentTitles.map(t => t.meta_title));
      console.log(`  Unique variations: ${uniqueWaterTitles.size}`);
      
      if (uniqueWaterTitles.size < waterTreatmentTitles.length) {
        console.log('\n  Repetitive titles in this category:');
        waterTreatmentTitles.forEach(item => {
          console.log(`    - "${item.meta_title}" (Topic: ${item.topic})`);
        });
      }
    }

    // 4. Title length analysis
    const titleLengthAnalysis = await sql<any[]>`
      SELECT 
        meta_title,
        LENGTH(meta_title) as length,
        topic
      FROM generated_content
      WHERE meta_title IS NOT NULL
      ORDER BY LENGTH(meta_title) DESC
    `;

    console.log('\n📏 TITLE LENGTH ANALYSIS:');
    console.log('-'.repeat(80));
    
    const tooShort = titleLengthAnalysis.filter(t => t.length < 30);
    const optimal = titleLengthAnalysis.filter(t => t.length >= 30 && t.length <= 60);
    const tooLong = titleLengthAnalysis.filter(t => t.length > 60);

    console.log(`\n  Too Short (<30 chars): ${tooShort.length} titles`);
    if (tooShort.length > 0 && tooShort.length <= 5) {
      tooShort.forEach(t => {
        console.log(`    - "${t.meta_title}" (${t.length} chars)`);
      });
    }

    console.log(`\n  Optimal (30-60 chars): ${optimal.length} titles`);
    
    console.log(`\n  Too Long (>60 chars): ${tooLong.length} titles`);
    if (tooLong.length > 0 && tooLong.length <= 5) {
      tooLong.forEach(t => {
        console.log(`    - "${t.meta_title}" (${t.length} chars)`);
      });
    }

    // 5. Common starting words analysis
    console.log('\n🔤 COMMON TITLE PATTERNS:');
    console.log('-'.repeat(80));

    const startingWords = await sql<any[]>`
      SELECT 
        SPLIT_PART(meta_title, ' ', 1) as first_word,
        COUNT(*) as count,
        STRING_AGG(DISTINCT topic, ', ' ORDER BY topic) as topics
      FROM generated_content
      WHERE meta_title IS NOT NULL
      GROUP BY SPLIT_PART(meta_title, ' ', 1)
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `;

    if (startingWords.length > 0) {
      console.log('\n  Most common starting words:');
      startingWords.forEach(item => {
        console.log(`    - "${item.first_word}": ${item.count} titles`);
        if (item.count > 3) {
          console.log(`      Topics: ${item.topics.substring(0, 100)}...`);
        }
      });
    }

    // 6. Similarity check (titles that are very similar)
    const allTitles = allContent.map(c => c.meta_title).filter(t => t);
    const similarTitles: Array<{title1: string, title2: string, similarity: number}> = [];
    
    for (let i = 0; i < allTitles.length - 1; i++) {
      for (let j = i + 1; j < allTitles.length; j++) {
        const similarity = calculateSimilarity(allTitles[i], allTitles[j]);
        if (similarity > 0.8 && allTitles[i] !== allTitles[j]) {
          similarTitles.push({
            title1: allTitles[i],
            title2: allTitles[j],
            similarity: similarity
          });
        }
      }
    }

    if (similarTitles.length > 0) {
      console.log('\n⚠️  HIGHLY SIMILAR TITLES (>80% similarity):');
      console.log('-'.repeat(80));
      similarTitles.slice(0, 10).forEach(pair => {
        console.log(`\n  Similarity: ${(pair.similarity * 100).toFixed(1)}%`);
        console.log(`    Title 1: "${pair.title1}"`);
        console.log(`    Title 2: "${pair.title2}"`);
      });
    }

    // 7. SEO recommendations
    console.log('\n\n💡 SEO RECOMMENDATIONS:');
    console.log('=' .repeat(80));

    const recommendations = [];

    if (duplicateTitles.length > 0) {
      recommendations.push({
        severity: 'CRITICAL',
        issue: `${duplicateTitles.length} duplicate meta titles found`,
        action: 'Each page must have a unique meta title. Add topic-specific modifiers or location keywords.'
      });
    }

    if (tooShort.length > 0) {
      recommendations.push({
        severity: 'HIGH',
        issue: `${tooShort.length} titles are too short (<30 chars)`,
        action: 'Expand titles to include more descriptive keywords and brand terms.'
      });
    }

    if (tooLong.length > 0) {
      recommendations.push({
        severity: 'MEDIUM',
        issue: `${tooLong.length} titles exceed 60 characters`,
        action: 'Shorten titles to ensure they display fully in search results.'
      });
    }

    if (similarTitles.length > 10) {
      recommendations.push({
        severity: 'HIGH',
        issue: `${similarTitles.length} pairs of highly similar titles detected`,
        action: 'Differentiate titles by adding unique value propositions, benefits, or specific features.'
      });
    }

    if (waterTreatmentTitles.length > 5 && uniqueWaterTitles.size < waterTreatmentTitles.length * 0.7) {
      recommendations.push({
        severity: 'HIGH',
        issue: 'Low title diversity in "Su Arıtma" category',
        action: 'Use variations like: system types, benefits, applications, locations, or problem-solving angles.'
      });
    }

    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.severity}] ${rec.issue}`);
      console.log(`   ➜ ${rec.action}`);
    });

    // 8. Title improvement suggestions
    console.log('\n\n🎯 TITLE VARIATION STRATEGIES:');
    console.log('=' .repeat(80));
    console.log(`
1. ADD LOCATION MODIFIERS:
   - "Su Arıtma Sistemleri İstanbul"
   - "Ankara Su Arıtma Çözümleri"

2. INCLUDE SPECIFIC BENEFITS:
   - "Enerji Tasarruflu Su Arıtma Sistemleri"
   - "Hızlı Kurulum Su Arıtma Çözümleri"

3. TARGET USER INTENT:
   - "Ev İçin Su Arıtma Sistemleri Fiyatları"
   - "Endüstriyel Su Arıtma Nasıl Yapılır?"

4. USE NUMBERS AND STATS:
   - "2024 Su Arıtma Sistemleri Rehberi"
   - "5 Adımda Su Arıtma Sistemi Seçimi"

5. DIFFERENTIATE BY APPLICATION:
   - "Otel ve Hastane Su Arıtma Sistemleri"
   - "Tarımsal Sulama İçin Su Arıtma"

6. INCLUDE BRAND OR USP:
   - "Gül Tekin - Profesyonel Su Arıtma"
   - "Garantili Su Arıtma Çözümleri"
`);

    console.log('\n✅ Analysis complete!\n');

  } catch (error) {
    console.error('❌ Error analyzing SEO titles:', error);
    process.exit(1);
  }
}

// Helper function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Levenshtein distance implementation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Run the analysis
analyzeSEOTitles().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});