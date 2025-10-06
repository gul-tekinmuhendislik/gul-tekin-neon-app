import { sql } from '../lib/db';

async function addFactoryTourNavigation() {
  try {
    console.log('🚀 Adding Fabrika Gezisi to navigation menu under Proje...');

    // First, get the Proje menu item ID
    const projeItem = await sql`
      SELECT id, title FROM navigation_menu
      WHERE title = 'Proje' AND parent_id IS NULL
      LIMIT 1
    `;

    if (projeItem.length === 0) {
      console.log('❌ Proje menu item not found in navigation');
      process.exit(1);
    }

    const projeParentId = projeItem[0].id;
    console.log(`✅ Found Proje menu item with ID: ${projeParentId}`);

    // Check if Fabrika Gezisi already exists
    const existingItem = await sql`
      SELECT id, title, href FROM navigation_menu
      WHERE title = 'Fabrika Gezisi' AND parent_id = ${projeParentId}
    `;

    if (existingItem.length > 0) {
      console.log('⚠️  Fabrika Gezisi already exists, updating...');

      await sql`
        UPDATE navigation_menu
        SET is_active = true,
            href = '/fabrika-gezisi',
            order_index = 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingItem[0].id}
      `;

      console.log('✅ Fabrika Gezisi updated');
    } else {
      // Add Fabrika Gezisi as a submenu under Proje
      await sql`
        INSERT INTO navigation_menu (title, href, order_index, is_active, parent_id)
        VALUES ('Fabrika Gezisi', '/fabrika-gezisi', 1, true, ${projeParentId})
      `;

      console.log('✅ Fabrika Gezisi added as submenu under Proje');
    }

    // Display updated menu structure
    const projeSubmenu = await sql`
      SELECT id, title, href, order_index, is_active
      FROM navigation_menu
      WHERE parent_id = ${projeParentId}
      ORDER BY order_index ASC
    `;

    console.log('\n📋 Proje submenu items:');
    console.table(projeSubmenu);

    // Display full navigation structure
    const allMenuItems = await sql`
      SELECT
        m1.id,
        m1.title,
        m1.href,
        m1.order_index,
        m1.parent_id,
        m2.title as parent_title
      FROM navigation_menu m1
      LEFT JOIN navigation_menu m2 ON m1.parent_id = m2.id
      WHERE m1.is_active = true
      ORDER BY
        COALESCE(m2.order_index, m1.order_index) ASC,
        m1.parent_id NULLS FIRST,
        m1.order_index ASC
    `;

    console.log('\n📋 Full navigation menu structure:');
    console.table(allMenuItems);

    console.log('\n✅ Navigation menu successfully updated!');

  } catch (error) {
    console.error('❌ Error updating navigation menu:', error);
    process.exit(1);
  }
}

addFactoryTourNavigation().then(() => {
  console.log('✅ Script completed successfully');
  process.exit(0);
});
