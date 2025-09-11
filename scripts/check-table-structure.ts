import { sql } from "../lib/db";

async function checkTableStructure() {
  try {
    console.log("🔍 Checking generated_content table structure...\n");
    
    // Get all columns from generated_content table
    const columns = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'generated_content'
      ORDER BY ordinal_position
    `;
    
    console.log("📋 Table: generated_content");
    console.log("=" + "=".repeat(60));
    
    if (columns.length === 0) {
      console.log("❌ Table 'generated_content' not found or no columns!");
      
      // Check if table exists
      const tableExists = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'generated_content'
      `;
      
      if (tableExists.length === 0) {
        console.log("\n⚠️  Table 'generated_content' does not exist in the database!");
      }
    } else {
      columns.forEach((col, index) => {
        console.log(`\n${index + 1}. Column: ${col.column_name}`);
        console.log(`   Type: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
        console.log(`   Nullable: ${col.is_nullable}`);
        console.log(`   Default: ${col.column_default || 'NULL'}`);
      });
      
      // Check specifically for prompt column
      const promptColumn = columns.find(col => col.column_name === 'prompt');
      
      console.log("\n" + "=".repeat(60));
      if (promptColumn) {
        console.log("✅ 'prompt' column EXISTS in the table!");
      } else {
        console.log("❌ 'prompt' column NOT FOUND in the table!");
      }
    }
    
    // Also check all tables in the database
    console.log("\n\n📊 All tables in the database:");
    console.log("=" + "=".repeat(60));
    
    const allTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    allTables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
  } catch (error) {
    console.error("❌ Error checking table structure:", error);
    process.exit(1);
  }
}

checkTableStructure().then(() => {
  console.log("\n✨ Check complete!");
  process.exit(0);
});