import { sql } from '../lib/db';

async function addBlogToNavigation() {
  try {
    // Blog menü öğesini ekle
    await sql`
      INSERT INTO navigation_menu (title, href, order_index, is_active) 
      VALUES ('Blog', '/blog', 3, true)
      ON CONFLICT DO NOTHING
    `;
    
    // İletişim'in order_index'ini güncelle
    await sql`
      UPDATE navigation_menu 
      SET order_index = 4 
      WHERE href = '/contact'
    `;
    
    console.log('✅ Blog menu item added successfully');
    
    // Güncel menü öğelerini göster
    const menuItems = await sql`
      SELECT * FROM navigation_menu 
      WHERE is_active = true 
      ORDER BY order_index ASC
    `;
    
    console.log('📋 Current menu items:');
    console.table(menuItems);
    
  } catch (error) {
    console.error('❌ Error adding blog to navigation:', error);
    process.exit(1);
  }
}

addBlogToNavigation().then(() => {
  console.log('✅ Blog navigation setup completed');
  process.exit(0);
});