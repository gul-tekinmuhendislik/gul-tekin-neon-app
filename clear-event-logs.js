require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || '';
const sql = neon(DATABASE_URL);

async function clearEventLogs() {
  try {
    console.log('Checking if event_logs table exists...');
    
    // Check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = 'event_logs'
      );
    `;

    if (tableExists[0].exists) {
      console.log('Found event_logs table. Clearing all records...');
      
      // Clear all records from the table
      const result = await sql`TRUNCATE TABLE event_logs`;
      
      console.log('✅ Successfully cleared all records from event_logs table');
      
      // Verify the table is empty
      const count = await sql`SELECT COUNT(*) as count FROM event_logs`;
      console.log(`Records remaining in event_logs: ${count[0].count}`);
    } else {
      console.log('ℹ️ event_logs table does not exist in the database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

clearEventLogs();
