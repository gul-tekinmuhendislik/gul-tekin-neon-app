import { sql } from '../lib/db.ts';
import fs from 'fs';
import path from 'path';

async function setupDynamicTables() {
  try {
    console.log('🚀 Setting up dynamic prompt tables...\n');

    // Read and execute the SQL file
    const sqlFile = fs.readFileSync(
      path.join(process.cwd(), 'migrations/create_dynamic_prompt_tables.sql'),
      'utf8'
    );

    // Split by semicolon and execute each statement
    const statements = sqlFile
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim() + ';');

    for (const statement of statements) {
      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
        console.log(`📋 Creating table: ${tableName}`);
      } else if (statement.includes('INSERT INTO')) {
        const tableName = statement.match(/INSERT INTO (\w+)/)?.[1];
        console.log(`➕ Inserting data into: ${tableName}`);
      } else if (statement.includes('CREATE INDEX')) {
        const indexName = statement.match(/CREATE INDEX (\w+)/)?.[1];
        console.log(`🔍 Creating index: ${indexName}`);
      }

      try {
        await sql.unsafe(statement);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error(`❌ Error executing statement:`, error.message);
        }
      }
    }

    // Verify tables
    console.log('\n✅ Verifying tables...\n');

    const tables = [
      'visual_elements',
      'composition_rules',
      'style_presets',
      'regional_themes',
      'negative_prompts',
      'prompt_templates'
    ];

    for (const table of tables) {
      try {
        const query = `SELECT COUNT(*) as count FROM ${table}`;
        const count = await sql.unsafe(query);
        console.log(`📊 ${table}: ${count[0]?.count || 0} records`);
      } catch (err) {
        console.log(`📊 ${table}: table not found or error`);
      }
    }

    console.log('\n🎉 All dynamic prompt tables set up successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

setupDynamicTables();