import { sql } from '../lib/db';

async function cleanupDuplicateNavigation() {
  try {
    console.log('🧹 Cleaning up duplicate navigation items...');

    // Delete the duplicate "Projeler" item (ID: 11)
    const deletedProjeler = await sql`
      DELETE FROM navigation_menu
      WHERE title = 'Projeler' AND id = 11
      RETURNING id, title
    `;

    if (deletedProjeler.length > 0) {
      console.log('✅ Deleted duplicate Projeler:', deletedProjeler[0]);
    }

    // Delete the duplicate "Ürünler" item (ID: 12)
    const deletedUrunler = await sql`
      DELETE FROM navigation_menu
      WHERE title = 'Ürünler' AND id = 12
      RETURNING id, title
    `;

    if (deletedUrunler.length > 0) {
      console.log('✅ Deleted duplicate Ürünler:', deletedUrunler[0]);
    }

    // Display cleaned navigation menu
    const menuItems = await sql`
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

    console.log('\n📋 Cleaned navigation menu:');
    console.table(menuItems);

    console.log('\n✅ Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error cleaning up navigation:', error);
    process.exit(1);
  }
}

cleanupDuplicateNavigation().then(() => {
  console.log('✅ Script completed successfully');
  process.exit(0);
});
