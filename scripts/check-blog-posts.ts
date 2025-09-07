import { sql } from '../lib/db';

async function checkBlogPosts() {
  try {
    // Tüm içerikleri kontrol et
    const allPosts = await sql`
      SELECT id, topic, title, slug, status, created_at
      FROM generated_content
      ORDER BY created_at DESC
    `;
    
    console.log('📋 All Blog Posts:');
    console.table(allPosts);
    
    // Status'a göre gruplama
    const statusCount = await sql`
      SELECT status, COUNT(*) as count
      FROM generated_content
      GROUP BY status
    `;
    
    console.log('\n📊 Posts by Status:');
    console.table(statusCount);
    
    // completed veya published olanları kontrol et
    const publishedPosts = await sql`
      SELECT id, topic, title, slug, status
      FROM generated_content
      WHERE status = 'completed' OR status = 'published'
    `;
    
    console.log('\n✅ Published/Completed Posts:');
    if (publishedPosts.length === 0) {
      console.log('No published or completed posts found!');
      
      // Tüm draft'ları published yap
      console.log('\n🔄 Updating all drafts to published...');
      const updateResult = await sql`
        UPDATE generated_content
        SET status = 'published', 
            published_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE status = 'draft'
        RETURNING id, title, status
      `;
      
      console.log('Updated posts:');
      console.table(updateResult);
    } else {
      console.table(publishedPosts);
    }
    
  } catch (error) {
    console.error('❌ Error checking blog posts:', error);
    process.exit(1);
  }
}

checkBlogPosts().then(() => {
  console.log('✅ Check completed');
  process.exit(0);
});