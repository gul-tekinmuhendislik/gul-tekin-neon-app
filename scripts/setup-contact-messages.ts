import { sql } from '../lib/db';

async function setupContactMessagesTable() {
  try {
    // Drop table if exists (for development)
    await sql`DROP TABLE IF EXISTS contact_messages CASCADE`;
    
    // Create contact_messages table
    await sql`
      CREATE TABLE contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'new',
        email_sent BOOLEAN DEFAULT false,
        email_sent_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX idx_contact_email ON contact_messages(email)`;
    await sql`CREATE INDEX idx_contact_status ON contact_messages(status)`;
    await sql`CREATE INDEX idx_contact_created ON contact_messages(created_at DESC)`;
    
    console.log('✅ Contact messages table created successfully');
    
    // Show table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'contact_messages'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Table structure:');
    console.table(tableInfo);
    
  } catch (error) {
    console.error('❌ Error setting up contact messages table:', error);
    process.exit(1);
  }
}

setupContactMessagesTable().then(() => {
  console.log('✅ Contact messages table setup completed');
  process.exit(0);
});