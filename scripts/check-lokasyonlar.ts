import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function checkLokasyonlar() {
  try {
    console.log('Checking lokasyonlar table...\n');

    // Get table schema
    const schema = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'lokasyonlar'
      ORDER BY ordinal_position;
    `;

    console.log('Table Schema:');
    console.table(schema);

    // Get row count
    const count = await sql`SELECT COUNT(*) as count FROM lokasyonlar;`;
    console.log(`\nTotal rows: ${count[0].count}\n`);

    // Get first 10 rows
    const rows = await sql`SELECT * FROM lokasyonlar LIMIT 10;`;
    console.log('First 10 rows:');
    console.table(rows);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkLokasyonlar();
