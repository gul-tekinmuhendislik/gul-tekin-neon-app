import { sql } from "../lib/db";

async function getNeonInfo() {
  try {
    console.log("🗄️  Neon Database Information");
    console.log("=====================================\n");

    // Database connection info
    console.log("📊 Connection Details:");
    console.log(`   Database: ${process.env.PGDATABASE}`);
    console.log(`   Host: ${process.env.PGHOST}`);
    console.log(`   User: ${process.env.PGUSER}`);
    console.log(`   Project ID: ${process.env.NEON_PROJECT_ID}\n`);

    // Get all tables
    const tables = await sql`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log(`📋 Tables (${tables.length}):`);
    for (const table of tables) {
      console.log(`   - ${table.tablename}`);
    }

    // Count rows in each table
    console.log("\n📊 Table Row Counts:");
    
    // Event logs
    try {
      const eventCount = await sql`SELECT COUNT(*) as count FROM event_logs`;
      console.log(`   event_logs: ${eventCount[0].count} rows`);
    } catch (e) {
      console.log(`   event_logs: Error counting`);
    }

    // Search results
    try {
      const searchCount = await sql`SELECT COUNT(*) as count FROM search_results`;
      console.log(`   search_results: ${searchCount[0].count} rows`);
    } catch (e) {
      console.log(`   search_results: Error counting`);
    }

    // Generated content
    try {
      const contentCount = await sql`SELECT COUNT(*) as count FROM generated_content`;
      console.log(`   generated_content: ${contentCount[0].count} rows`);
    } catch (e) {
      console.log(`   generated_content: Error counting`);
    }

    // Navigation items
    try {
      const navCount = await sql`SELECT COUNT(*) as count FROM navigation_items`;
      console.log(`   navigation_items: ${navCount[0].count} rows`);
    } catch (e) {
      console.log(`   navigation_items: Error counting`);
    }

    // Get recent data samples
    console.log("\n📈 Recent Data Samples:");
    
    // Event logs
    try {
      const eventLogs = await sql`
        SELECT name, COUNT(*) as count
        FROM event_logs
        GROUP BY name
        ORDER BY count DESC
        LIMIT 5
      `;
      
      if (eventLogs.length > 0) {
        console.log("\n   Event Logs (Top Events):");
        for (const event of eventLogs) {
          console.log(`   - ${event.name}: ${event.count} occurrences`);
        }
      }
    } catch (e) {
      console.log("   Event Logs: No data");
    }

    // Search results
    try {
      const searchResults = await sql`
        SELECT 
          search_query,
          COUNT(*) as count,
          MAX(created_at) as last_search
        FROM search_results
        GROUP BY search_query
        ORDER BY last_search DESC
        LIMIT 5
      `;
      
      if (searchResults.length > 0) {
        console.log("\n   Search Results (Recent Queries):");
        for (const result of searchResults) {
          const date = new Date(result.last_search).toLocaleString('tr-TR');
          console.log(`   - "${result.search_query}": ${result.count} results (${date})`);
        }
      }
    } catch (e) {
      console.log("   Search Results: No data");
    }

    // Generated content
    try {
      const generatedContent = await sql`
        SELECT 
          topic,
          status,
          created_at
        FROM generated_content
        ORDER BY created_at DESC
        LIMIT 5
      `;
      
      if (generatedContent.length > 0) {
        console.log("\n   Generated Content (Latest):");
        for (const content of generatedContent) {
          const date = new Date(content.created_at).toLocaleString('tr-TR');
          console.log(`   - ${content.topic} [${content.status}] - ${date}`);
        }
      }
    } catch (e) {
      console.log("   Generated Content: No data");
    }

    // Get unique URLs in search results
    try {
      const uniqueUrls = await sql`
        SELECT COUNT(DISTINCT result_url) as unique_count
        FROM search_results
      `;
      console.log(`\n   🔗 Unique URLs in search results: ${uniqueUrls[0].unique_count}`);
    } catch (e) {
      // Skip if error
    }

    // Get database size
    try {
      const dbSize = await sql`
        SELECT 
          pg_database_size(current_database()) as size,
          pg_size_pretty(pg_database_size(current_database())) as size_pretty
      `;
      
      console.log("\n💾 Database Size:");
      console.log(`   ${dbSize[0].size_pretty} (${dbSize[0].size} bytes)`);
    } catch (e) {
      console.log("\n💾 Database Size: Unable to retrieve");
    }

    // Connection stats
    try {
      const connections = await sql`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN state = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN state = 'idle' THEN 1 ELSE 0 END) as idle
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;
      
      console.log("\n🔌 Active Connections:");
      console.log(`   Total: ${connections[0].total}`);
      console.log(`   Active: ${connections[0].active || 0}`);
      console.log(`   Idle: ${connections[0].idle || 0}`);
    } catch (e) {
      console.log("\n🔌 Connection stats unavailable");
    }

    console.log("\n✅ Neon database information retrieved successfully!");
    
  } catch (error) {
    console.error("❌ Error getting Neon info:", error);
    process.exit(1);
  }
}

getNeonInfo().then(() => {
  console.log("\n🎉 Done!");
  process.exit(0);
});