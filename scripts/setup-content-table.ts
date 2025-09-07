import { sql } from '../lib/db';

async function setupContentTable() {
  try {
    // Drop table if exists (for development)
    await sql`DROP TABLE IF EXISTS generated_content CASCADE`;
    
    // Create generated_content table
    await sql`
      CREATE TABLE generated_content (
        id SERIAL PRIMARY KEY,
        topic VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        meta_title VARCHAR(100),
        meta_description VARCHAR(200),
        keywords TEXT[],
        search_data JSONB,
        status VARCHAR(50) DEFAULT 'draft',
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX idx_content_topic ON generated_content(topic)`;
    await sql`CREATE INDEX idx_content_status ON generated_content(status)`;
    await sql`CREATE INDEX idx_content_created ON generated_content(created_at DESC)`;
    
    console.log('✅ Generated content table created successfully');
    
    // Show table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'generated_content'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Table structure:');
    console.table(tableInfo);
    
  } catch (error) {
    console.error('❌ Error setting up content table:', error);
    process.exit(1);
  }
}

setupContentTable().then(() => {
  console.log('✅ Content table setup completed');
  process.exit(0);
});