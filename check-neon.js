const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to Neon Database\n');

    // Get all tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📊 Tables:\n');
    for (const row of tablesRes.rows) {
      console.log(`  • ${row.table_name}`);
    }

    console.log('\n\n📋 Schema Details:\n');

    // Get detailed schema for each table
    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      const columnsRes = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      console.log(`\n${tableName.toUpperCase()}:`);
      for (const col of columnsRes.rows) {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
        const defaultVal = col.column_default ? ` = ${col.column_default}` : '';
        console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      }

      // Get row count
      const countRes = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      console.log(`  📌 Rows: ${countRes.rows[0].count}`);
    }

    console.log('\n✨ Done!');
    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
