import { sql } from '../lib/db';

async function setupEventLogsTable() {
  try {
    // Drop table if exists (for development)
    await sql`DROP TABLE IF EXISTS event_logs CASCADE`;
    
    // Create event_logs table
    await sql`
      CREATE TABLE event_logs (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(255) NOT NULL,
        event_type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        payload JSONB,
        metadata JSONB,
        error_message TEXT,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes for better performance
    await sql`CREATE INDEX idx_event_logs_event_name ON event_logs(event_name)`;
    await sql`CREATE INDEX idx_event_logs_status ON event_logs(status)`;
    await sql`CREATE INDEX idx_event_logs_created_at ON event_logs(created_at DESC)`;
    
    console.log('✅ Event logs table created successfully');
    
    // Insert sample event logs
    await sql`
      INSERT INTO event_logs (event_name, event_type, status, payload, metadata) VALUES
      ('user.signup', 'user', 'completed', 
        '{"email": "test@example.com", "name": "Test User"}', 
        '{"ip": "127.0.0.1", "user_agent": "Mozilla/5.0"}'
      ),
      ('email.sent', 'notification', 'completed', 
        '{"to": "user@example.com", "subject": "Welcome!"}', 
        '{"provider": "resend", "template_id": "welcome_email"}'
      ),
      ('data.sync', 'system', 'pending', 
        '{"source": "api", "destination": "database"}', 
        '{"scheduled": true, "priority": "low"}'
      )
    `;
    
    console.log('✅ Sample event logs inserted successfully');
    
    // Query and display the event logs
    const eventLogs = await sql`
      SELECT id, event_name, event_type, status, created_at
      FROM event_logs 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log('📋 Current event logs:');
    console.table(eventLogs);
    
  } catch (error) {
    console.error('❌ Error setting up event logs table:', error);
    process.exit(1);
  }
}

setupEventLogsTable().then(() => {
  console.log('✅ Event logs setup completed successfully');
  process.exit(0);
});