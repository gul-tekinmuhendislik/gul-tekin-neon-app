import { sql } from '../lib/db';

async function setupSearchResultsTable() {
  try {
    // Drop table if exists (for development)
    await sql`DROP TABLE IF EXISTS search_results CASCADE`;
    
    // Create search_results table
    await sql`
      CREATE TABLE search_results (
        id SERIAL PRIMARY KEY,
        search_query VARCHAR(500) NOT NULL,
        search_type VARCHAR(100) DEFAULT 'auto',
        result_title TEXT,
        result_url TEXT,
        result_content TEXT,
        result_score FLOAT,
        result_published_date TIMESTAMP,
        result_author VARCHAR(255),
        highlights TEXT[],
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes for better performance
    await sql`CREATE INDEX idx_search_results_query ON search_results(search_query)`;
    await sql`CREATE INDEX idx_search_results_created_at ON search_results(created_at DESC)`;
    await sql`CREATE INDEX idx_search_results_score ON search_results(result_score DESC)`;
    
    console.log('✅ Search results table created successfully');
    
    // Query and display the table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'search_results'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Table structure:');
    console.table(tableInfo);
    
  } catch (error) {
    console.error('❌ Error setting up search results table:', error);
    process.exit(1);
  }
}

setupSearchResultsTable().then(() => {
  console.log('✅ Search results setup completed successfully');
  process.exit(0);
});