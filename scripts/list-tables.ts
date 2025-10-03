import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function listTables() {
  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('Available tables in database:');
    tables.forEach((t: any) => console.log(`  - ${t.table_name}`));
  } catch (error) {
    console.error('Error:', error);
  }
}

listTables();
