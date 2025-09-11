import { sql } from "../lib/db";

async function addPromptField() {
  try {
    console.log("🚀 Adding prompt field to generated_content table...\n");
    
    // Directly add the prompt column
    await sql`
      ALTER TABLE generated_content 
      ADD COLUMN IF NOT EXISTS prompt TEXT DEFAULT NULL
    `;
    
    console.log("✅ ALTER TABLE command executed successfully!");
    
    // Add comment to the column
    await sql`
      COMMENT ON COLUMN generated_content.prompt IS 'The prompt used to generate this content'
    `;
    
    console.log("✅ Column comment added!");
    
    // Verify the column was added
    const columnCheck = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'generated_content' 
      AND column_name = 'prompt'
    `;
    
    if (columnCheck.length > 0) {
      console.log("\n✅ SUCCESS! Column 'prompt' has been added:");
      console.log(`   Name: ${columnCheck[0].column_name}`);
      console.log(`   Type: ${columnCheck[0].data_type}`);
      console.log(`   Nullable: ${columnCheck[0].is_nullable}`);
      console.log(`   Default: ${columnCheck[0].column_default || 'NULL'}`);
    } else {
      console.log("\n⚠️  Column was not found after adding. Please check manually.");
    }
    
    // Show all columns to confirm
    console.log("\n📋 All columns in generated_content table:");
    const allColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'generated_content'
      ORDER BY ordinal_position
    `;
    
    allColumns.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error("❌ Error adding prompt field:", error);
    process.exit(1);
  }
}

addPromptField().then(() => {
  console.log("\n🎉 Done!");
  process.exit(0);
});