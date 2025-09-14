import { sql } from '../lib/db';

async function analyzeSearchData() {
  try {
    // Get sample of recent data
    console.log('📝 Recent Search Results Sample:\n');

    const recentResults = await sql`
      SELECT
        search_query,
        result_title,
        result_url,
        LENGTH(result_content) as content_length,
        result_score,
        result_published_date,
        created_at
      FROM search_results
      ORDER BY created_at DESC
      LIMIT 5
    `;

    recentResults.forEach((result, index) => {
      console.log(`${index + 1}. Query: "${result.search_query}"`);
      console.log(`   Title: ${result.result_title}`);
      console.log(`   URL: ${result.result_url}`);
      console.log(`   Content Length: ${result.content_length} chars`);
      console.log(`   Score: ${result.result_score || 'N/A'}`);
      console.log(`   Published: ${result.result_published_date || 'N/A'}`);
      console.log(`   Saved: ${result.created_at}`);
      console.log('');
    });

    // Analyze query patterns
    console.log('🔍 Query Pattern Analysis:\n');

    const queryPatterns = await sql`
      SELECT
        search_query,
        COUNT(*) as result_count,
        AVG(LENGTH(result_content)) as avg_content_length,
        MIN(created_at) as first_search,
        MAX(created_at) as last_search
      FROM search_results
      GROUP BY search_query
      ORDER BY result_count DESC
    `;

    queryPatterns.forEach(pattern => {
      console.log(`Query: "${pattern.search_query}"`);
      console.log(`  - Results saved: ${pattern.result_count}`);
      console.log(`  - Avg content: ${Math.round(pattern.avg_content_length)} chars`);
      console.log(`  - First: ${new Date(pattern.first_search).toLocaleDateString()}`);
      console.log(`  - Last: ${new Date(pattern.last_search).toLocaleDateString()}`);
      console.log('');
    });

    // Check metadata usage
    console.log('📊 Metadata Analysis:\n');

    const metadataStats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(metadata) as has_metadata,
        COUNT(CASE WHEN metadata->>'id' IS NOT NULL THEN 1 END) as has_id,
        COUNT(CASE WHEN metadata->>'summary' IS NOT NULL THEN 1 END) as has_summary
      FROM search_results
    `;

    const stats = metadataStats[0];
    console.log(`Total records: ${stats.total}`);
    console.log(`Has metadata: ${stats.has_metadata} (${Math.round(stats.has_metadata/stats.total*100)}%)`);
    console.log(`Has ID in metadata: ${stats.has_id}`);
    console.log(`Has summary in metadata: ${stats.has_summary}`);

    // Domain analysis
    console.log('\n🌐 Top Domains:\n');

    const domains = await sql`
      SELECT
        REGEXP_REPLACE(result_url, '^https?://([^/]+).*', '\\1') as domain,
        COUNT(*) as count
      FROM search_results
      WHERE result_url IS NOT NULL
      GROUP BY domain
      ORDER BY count DESC
      LIMIT 10
    `;

    domains.forEach(domain => {
      console.log(`  ${domain.domain}: ${domain.count} results`);
    });

    // Check for old data that should be cleaned
    console.log('\n🧹 Cleanup Status:\n');

    const oldData = await sql`
      SELECT
        COUNT(*) as old_records,
        MIN(created_at) as oldest_date
      FROM search_results
      WHERE created_at < NOW() - INTERVAL '7 days'
    `;

    if (oldData[0].old_records > 0) {
      console.log(`⚠️  Found ${oldData[0].old_records} records older than 7 days`);
      console.log(`   Oldest: ${oldData[0].oldest_date}`);
    } else {
      console.log('✅ No records older than 7 days (cleanup working correctly)');
    }

  } catch (error) {
    console.error('Error analyzing search data:', error);
  }

  process.exit(0);
}

analyzeSearchData();