import { sql } from "../lib/db";
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add_image_to_generated_content.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log("🚀 Running migration to add image field to generated_content table...");
    
    // Execute the migration
    await sql.unsafe(migrationSQL);
    
    console.log("✅ Migration completed successfully!");
    
    // Verify the column was added
    const columnCheck = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'generated_content' 
      AND column_name = 'image'
    `;
    
    if (columnCheck.length > 0) {
      console.log("\n📋 Column details:");
      console.log(`   Name: ${columnCheck[0].column_name}`);
      console.log(`   Type: ${columnCheck[0].data_type}`);
      console.log(`   Nullable: ${columnCheck[0].is_nullable}`);
      console.log(`   Default: ${columnCheck[0].column_default || 'NULL'}`);
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration().then(() => {
  console.log("\n🎉 Done!");
  process.exit(0);
});