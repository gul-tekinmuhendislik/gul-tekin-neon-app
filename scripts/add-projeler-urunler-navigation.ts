import { sql } from '../lib/db';

async function addProjeUrunNavigation() {
  try {
    console.log('🚀 Adding Projeler and Ürünler to navigation menu...');
    
    // First, check if these items already exist
    const existingItems = await sql`
      SELECT id, title, href FROM navigation_menu 
      WHERE title IN ('Projeler', 'Ürünler')
    `;
    
    if (existingItems.length > 0) {
      console.log('⚠️  Some items already exist:', existingItems.map(item => item.title).join(', '));
      
      // Update existing items to ensure they are active and have correct hrefs
      await sql`
        UPDATE navigation_menu 
        SET is_active = true, href = '/projeler', order_index = 6, updated_at = CURRENT_TIMESTAMP
        WHERE title = 'Projeler'
      `;
      
      await sql`
        UPDATE navigation_menu 
        SET is_active = true, href = '/urunler', order_index = 7, updated_at = CURRENT_TIMESTAMP
        WHERE title = 'Ürünler'
      `;
      
      console.log('✅ Existing items updated');
    }
    
    // Add new items if they don't exist
    const projelerExists = existingItems.some(item => item.title === 'Projeler');
    const urunlerExists = existingItems.some(item => item.title === 'Ürünler');
    
    if (!projelerExists) {
      // Get the max order_index to avoid conflicts
      const maxOrder = await sql`
        SELECT COALESCE(MAX(order_index), 0) as max_order FROM navigation_menu
      `;
      const nextOrder = maxOrder[0].max_order + 1;
      
      await sql`
        INSERT INTO navigation_menu (title, href, order_index, is_active) 
        VALUES ('Projeler', '/projeler', ${nextOrder}, true)
      `;
      console.log('✅ Projeler added to navigation menu');
    }
    
    if (!urunlerExists) {
      // Get the max order_index to avoid conflicts
      const maxOrder = await sql`
        SELECT COALESCE(MAX(order_index), 0) as max_order FROM navigation_menu
      `;
      const nextOrder = maxOrder[0].max_order + 1;
      
      await sql`
        INSERT INTO navigation_menu (title, href, order_index, is_active) 
        VALUES ('Ürünler', '/urunler', ${nextOrder}, true)
      `;
      console.log('✅ Ürünler added to navigation menu');
    }
    
    // Display updated menu items
    const menuItems = await sql`
      SELECT title, href, order_index FROM navigation_menu 
      WHERE is_active = true AND parent_id IS NULL
      ORDER BY order_index ASC
    `;
    
    console.log('\n📋 Updated navigation menu:');
    console.table(menuItems);
    
    console.log('\n✅ Navigation menu successfully updated!');
    
  } catch (error) {
    console.error('❌ Error updating navigation menu:', error);
    process.exit(1);
  }
}

addProjeUrunNavigation().then(() => {
  console.log('✅ Script completed successfully');
  process.exit(0);
});