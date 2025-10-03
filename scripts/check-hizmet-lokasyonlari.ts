import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function checkHizmetLokasyonlari() {
  try {
    console.log('Checking hizmet_lokasyonlari table...\n');

    // Get table schema
    const schema = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'hizmet_lokasyonlari'
      ORDER BY ordinal_position;
    `;

    console.log('Table Schema:');
    console.table(schema);

    // Get row count
    const count = await sql`SELECT COUNT(*) as count FROM hizmet_lokasyonlari;`;
    console.log(`\nTotal rows: ${count[0].count}\n`);

    // Get first 20 rows
    const rows = await sql`SELECT * FROM hizmet_lokasyonlari LIMIT 20;`;
    console.log('First 20 rows:');
    console.table(rows);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkHizmetLokasyonlari();
