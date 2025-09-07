import { sql } from '../lib/db';

async function checkSchema() {
  try {
    // generated_content tablosunun şemasını kontrol et
    const schema = await sql`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'generated_content'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Generated Content Table Schema:');
    console.table(schema);
    
    // Örnek veri çek
    const sampleData = await sql`
      SELECT * FROM generated_content
      LIMIT 2
    `;
    
    console.log('\n📝 Sample Data:');
    console.log(JSON.stringify(sampleData, null, 2));
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
    process.exit(1);
  }
}

checkSchema().then(() => {
  console.log('✅ Schema check completed');
  process.exit(0);
});