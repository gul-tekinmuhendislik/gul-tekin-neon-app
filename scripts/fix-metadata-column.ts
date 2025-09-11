import { sql } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function fixMetadataColumn() {
  try {
    console.log('🔧 Fixing metadata column in generated_content table...');
    
    // Read and execute the migration SQL
    const migrationPath = path.join(__dirname, '../migrations/add_metadata_to_generated_content.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Metadata column added successfully');
    
    // Verify the column was added
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'generated_content'
        AND column_name = 'metadata'
    `;
    
    if (tableInfo.length > 0) {
      console.log('📋 Metadata column details:');
      console.table(tableInfo);
    } else {
      console.error('❌ Metadata column was not created');
    }
    
    // Test updating a record with metadata (if any records exist)
    const existingRecords = await sql`
      SELECT id FROM generated_content LIMIT 1
    `;
    
    if (existingRecords.length > 0) {
      const testUpdate = await sql`
        UPDATE generated_content
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'),
          '{migrationTest}',
          ${'true'}::jsonb
        )
        WHERE id = ${existingRecords[0].id}
        RETURNING id, metadata
      `;
      
      console.log('✅ Test metadata update successful');
      console.log('Updated record:', testUpdate[0]);
    }
    
  } catch (error) {
    console.error('❌ Error fixing metadata column:', error);
    process.exit(1);
  }
}

fixMetadataColumn().then(() => {
  console.log('✅ Metadata column fix completed');
  process.exit(0);
});