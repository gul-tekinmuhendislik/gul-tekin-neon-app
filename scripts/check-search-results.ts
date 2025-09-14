import { sql } from '../lib/db';

async function checkSearchResults() {
  try {
    // Check if table exists and get column info
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'search_results'
      ORDER BY ordinal_position
    `;

    if (tableInfo.length === 0) {
      console.log('❌ search_results table does not exist!');
      console.log('\nCreating search_results table...');

      // Create the table
      await sql`
        CREATE TABLE IF NOT EXISTS search_results (
          id SERIAL PRIMARY KEY,
          search_query TEXT NOT NULL,
          search_type VARCHAR(50) DEFAULT 'auto',
          result_title TEXT,
          result_url TEXT UNIQUE,
          result_content TEXT,
          result_score NUMERIC(5,2),
          result_published_date TIMESTAMP,
          result_author TEXT,
          highlights TEXT[],
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      console.log('✅ search_results table created successfully!');
    } else {
      console.log('✅ search_results table exists with columns:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }

    // Get statistics
    const stats = await sql`
      SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT search_query) as unique_queries,
        COUNT(DISTINCT result_url) as unique_urls,
        MIN(created_at) as oldest_record,
        MAX(created_at) as newest_record
      FROM search_results
    `;

    console.log('\n📊 Table Statistics:');
    console.log(`  Total Records: ${stats[0].total_records}`);
    console.log(`  Unique Queries: ${stats[0].unique_queries}`);
    console.log(`  Unique URLs: ${stats[0].unique_urls}`);
    console.log(`  Oldest Record: ${stats[0].oldest_record || 'No data'}`);
    console.log(`  Newest Record: ${stats[0].newest_record || 'No data'}`);

    // Get recent searches
    const recentSearches = await sql`
      SELECT
        search_query,
        COUNT(*) as result_count,
        MAX(created_at) as last_searched
      FROM search_results
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY search_query
      ORDER BY last_searched DESC
      LIMIT 5
    `;

    if (recentSearches.length > 0) {
      console.log('\n🔍 Recent Searches (Last 24 hours):');
      recentSearches.forEach(search => {
        console.log(`  - "${search.search_query}": ${search.result_count} results`);
      });
    }

    // Check for duplicates
    const duplicates = await sql`
      SELECT result_url, COUNT(*) as count
      FROM search_results
      GROUP BY result_url
      HAVING COUNT(*) > 1
      LIMIT 5
    `;

    if (duplicates.length > 0) {
      console.log('\n⚠️  Found duplicate URLs:');
      duplicates.forEach(dup => {
        console.log(`  - ${dup.result_url}: ${dup.count} times`);
      });
    } else {
      console.log('\n✅ No duplicate URLs found');
    }

  } catch (error) {
    console.error('Error checking search_results:', error);
  }

  process.exit(0);
}

checkSearchResults();