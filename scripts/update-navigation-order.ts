import { sql } from '../lib/db';

async function updateNavigationOrder() {
  try {
    console.log('🚀 Updating navigation menu order...');
    
    // Update order_index for all menu items
    const updates = [
      { title: 'Ana Sayfa', order: 1 },
      { title: 'Ürünler', order: 2 },
      { title: 'Hizmetler', order: 3 },
      { title: 'Projeler', order: 4 },
      { title: 'Markalar', order: 5 },
      { title: 'Hakkımızda', order: 6 },
      { title: 'Blog', order: 7 },
      { title: 'İletişim', order: 8 }
    ];
    
    for (const item of updates) {
      await sql`
        UPDATE navigation_menu 
        SET order_index = ${item.order}, updated_at = CURRENT_TIMESTAMP
        WHERE title = ${item.title}
      `;
      console.log(`✅ ${item.title} updated to order ${item.order}`);
    }
    
    // Display updated menu items
    const menuItems = await sql`
      SELECT title, href, order_index FROM navigation_menu 
      WHERE is_active = true AND parent_id IS NULL
      ORDER BY order_index ASC
    `;
    
    console.log('\n📋 Updated navigation menu order:');
    console.table(menuItems);
    
    console.log('\n✅ Navigation order successfully updated!');
    
  } catch (error) {
    console.error('❌ Error updating navigation order:', error);
    process.exit(1);
  }
}

updateNavigationOrder().then(() => {
  console.log('✅ Script completed successfully');
  process.exit(0);
});