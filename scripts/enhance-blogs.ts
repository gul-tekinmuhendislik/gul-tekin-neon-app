/**
 * Blog Enhancement Script
 * 130 bloğu otomatik iyileştirir: FAQ + CTA + Meta Optimization
 *
 * Kullanım:
 * - Test (5 blog): npx tsx scripts/enhance-blogs.ts --test
 * - Tüm bloglar: npx tsx scripts/enhance-blogs.ts --all
 * - Spesifik ID'ler: npx tsx scripts/enhance-blogs.ts --ids 131,130,129
 */

import { sql } from '@/lib/db';
import { getFAQByTopic, formatFAQForMarkdown } from '@/lib/blog-enhancement/faq-database';
import { formatCTAForMarkdown } from '@/lib/blog-enhancement/cta-templates';
import { optimizeMetaDescription, calculateMetaScore } from '@/lib/blog-enhancement/meta-optimizer';

interface BlogData {
  id: number;
  topic: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

interface EnhancementResult {
  id: number;
  title: string;
  before: {
    contentLength: number;
    metaLength: number;
    metaScore: number;
    hasFAQ: boolean;
    hasCTA: boolean;
  };
  after: {
    contentLength: number;
    metaLength: number;
    metaScore: number;
    hasFAQ: boolean;
    hasCTA: boolean;
  };
  improvements: string[];
  success: boolean;
  error?: string;
}

/**
 * Blog'u iyileştirir
 */
async function enhanceBlog(blog: BlogData, dryRun: boolean = true): Promise<EnhancementResult> {
  const result: EnhancementResult = {
    id: blog.id,
    title: blog.title,
    before: {
      contentLength: blog.content.length,
      metaLength: blog.meta_description?.length || 0,
      metaScore: calculateMetaScore(blog.meta_description, blog.topic, blog.keywords),
      hasFAQ: blog.content.includes('## ❓ Sık Sorulan Sorular') || blog.content.includes('Sık Sorulan Sorular'),
      hasCTA: blog.content.includes('📞') || blog.content.includes('Hemen Arayın') || blog.content.includes('İletişim Bilgileri')
    },
    after: {
      contentLength: 0,
      metaLength: 0,
      metaScore: 0,
      hasFAQ: false,
      hasCTA: false
    },
    improvements: [],
    success: false
  };

  try {
    let enhancedContent = blog.content;

    // 1. FAQ ekle (yoksa)
    if (!result.before.hasFAQ) {
      const faqs = getFAQByTopic(blog.topic);
      if (faqs.length > 0) {
        const faqSection = formatFAQForMarkdown(faqs);
        enhancedContent += faqSection;
        result.improvements.push(`✅ ${faqs.length} FAQ eklendi`);
      } else {
        result.improvements.push(`⚠️ FAQ bulunamadı (topic: ${blog.topic})`);
      }
    } else {
      result.improvements.push('ℹ️ FAQ zaten mevcut');
    }

    // 2. CTA ekle (yoksa)
    if (!result.before.hasCTA) {
      const ctaSection = formatCTAForMarkdown(blog.topic);
      enhancedContent += ctaSection;
      result.improvements.push('✅ CTA eklendi');
    } else {
      result.improvements.push('ℹ️ CTA zaten mevcut');
    }

    // 3. Meta description optimize et
    const metaResult = optimizeMetaDescription(
      blog.meta_description,
      blog.topic,
      blog.title,
      blog.keywords
    );

    let optimizedMeta = metaResult.optimized;

    if (metaResult.improved) {
      result.improvements.push(
        `✅ Meta optimize edildi (${result.before.metaLength}→${metaResult.length} char, score: ${result.before.metaScore}→${metaResult.score})`
      );
    } else {
      result.improvements.push(`ℹ️ Meta zaten optimal (score: ${metaResult.score})`);
    }

    // Sonuç istatistikleri
    result.after = {
      contentLength: enhancedContent.length,
      metaLength: optimizedMeta.length,
      metaScore: metaResult.score,
      hasFAQ: true,
      hasCTA: true
    };

    // Database'e kaydet (dry-run değilse)
    if (!dryRun) {
      await sql`
        UPDATE generated_content
        SET
          content = ${enhancedContent},
          meta_description = ${optimizedMeta},
          updated_at = NOW()
        WHERE id = ${blog.id}
      `;
      result.improvements.push('💾 Database güncellendi');
    } else {
      result.improvements.push('🔍 DRY RUN - Database güncellenmedi');
    }

    result.success = true;

  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error enhancing blog ${blog.id}:`, error);
  }

  return result;
}

/**
 * Toplu blog iyileştirme
 */
async function enhanceBlogs(options: {
  testMode?: boolean;
  allBlogs?: boolean;
  blogIds?: number[];
  dryRun?: boolean;
}) {
  const { testMode = false, allBlogs = false, blogIds = [], dryRun = true } = options;

  console.log('🚀 Blog Enhancement Script Başlatıldı\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (test)' : '💾 LIVE (gerçek update)'}\n`);

  // Blogları çek
  let blogs: BlogData[];

  if (testMode) {
    console.log('📊 Test Mode: İlk 5 blog seçiliyor...\n');
    blogs = await sql`
      SELECT * FROM generated_content
      WHERE status IN ('completed', 'published')
      ORDER BY created_at DESC
      LIMIT 5
    `;
  } else if (blogIds.length > 0) {
    console.log(`📊 Spesifik ID'ler: ${blogIds.join(', ')}\n`);
    blogs = await sql`
      SELECT * FROM generated_content
      WHERE id = ANY(${blogIds})
      AND status IN ('completed', 'published')
    `;
  } else if (allBlogs) {
    console.log('📊 Tüm bloglar seçiliyor...\n');
    blogs = await sql`
      SELECT * FROM generated_content
      WHERE status IN ('completed', 'published')
      ORDER BY created_at DESC
    `;
  } else {
    console.log('❌ Hata: --test, --all veya --ids belirtilmeli');
    process.exit(1);
  }

  console.log(`Toplam ${blogs.length} blog bulundu.\n`);
  console.log('─'.repeat(80) + '\n');

  // Her blogu işle
  const results: EnhancementResult[] = [];

  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    console.log(`[${i + 1}/${blogs.length}] ${blog.title}`);
    console.log(`   ID: ${blog.id} | Topic: ${blog.topic}`);

    const result = await enhanceBlog(blog, dryRun);
    results.push(result);

    console.log(`   Önce: ${result.before.contentLength} char | Meta: ${result.before.metaLength} char (score: ${result.before.metaScore})`);
    console.log(`   Sonra: ${result.after.contentLength} char | Meta: ${result.after.metaLength} char (score: ${result.after.metaScore})`);
    console.log(`   İyileştirmeler:`);
    result.improvements.forEach(imp => console.log(`      ${imp}`));
    console.log(`   ${result.success ? '✅ Başarılı' : '❌ Hata: ' + result.error}`);
    console.log('─'.repeat(80) + '\n');

    // Rate limiting (her 10 blogda bir 1 saniye bekle)
    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Özet rapor
  console.log('\n📊 ÖZET RAPOR\n');
  console.log('─'.repeat(80));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const faqAdded = results.filter(r => r.improvements.some(i => i.includes('FAQ eklendi'))).length;
  const ctaAdded = results.filter(r => r.improvements.some(i => i.includes('CTA eklendi'))).length;
  const metaOptimized = results.filter(r => r.improvements.some(i => i.includes('Meta optimize'))).length;

  const avgContentBefore = results.reduce((sum, r) => sum + r.before.contentLength, 0) / results.length;
  const avgContentAfter = results.reduce((sum, r) => sum + r.after.contentLength, 0) / results.length;
  const avgMetaScoreBefore = results.reduce((sum, r) => sum + r.before.metaScore, 0) / results.length;
  const avgMetaScoreAfter = results.reduce((sum, r) => sum + r.after.metaScore, 0) / results.length;

  console.log(`Toplam Blog: ${results.length}`);
  console.log(`✅ Başarılı: ${successful}`);
  console.log(`❌ Hatalı: ${failed}`);
  console.log();
  console.log(`📝 FAQ Eklendi: ${faqAdded} blog`);
  console.log(`📞 CTA Eklendi: ${ctaAdded} blog`);
  console.log(`📊 Meta Optimize: ${metaOptimized} blog`);
  console.log();
  console.log(`Ortalama İçerik Uzunluğu: ${Math.round(avgContentBefore)} → ${Math.round(avgContentAfter)} char (+${Math.round(avgContentAfter - avgContentBefore)})`);
  console.log(`Ortalama Meta Score: ${Math.round(avgMetaScoreBefore)} → ${Math.round(avgMetaScoreAfter)} (+${Math.round(avgMetaScoreAfter - avgMetaScoreBefore)})`);
  console.log('─'.repeat(80));

  if (dryRun) {
    console.log('\n🔍 DRY RUN tamamlandı. Gerçek update için --live flag ekleyin.\n');
    console.log('Örnek: npx tsx scripts/enhance-blogs.ts --test --live\n');
  } else {
    console.log('\n💾 Database güncelleme tamamlandı!\n');
  }

  // Sonuçları dosyaya kaydet
  const reportPath = `/workspaces/gul-tekin-neon-app/blog-enhancement-report-${Date.now()}.json`;
  const fs = require('fs');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detaylı rapor: ${reportPath}\n`);
}

// CLI parsing
const args = process.argv.slice(2);
const options = {
  testMode: args.includes('--test'),
  allBlogs: args.includes('--all'),
  dryRun: !args.includes('--live'),
  blogIds: [] as number[]
};

// --ids parametresi varsa parse et
const idsIndex = args.indexOf('--ids');
if (idsIndex !== -1 && args[idsIndex + 1]) {
  options.blogIds = args[idsIndex + 1].split(',').map(id => parseInt(id.trim()));
}

// Script çalıştır
enhanceBlogs(options)
  .then(() => {
    console.log('✅ Script başarıyla tamamlandı!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script hatası:', error);
    process.exit(1);
  });
