import { sql } from '../lib/db';

async function setupNavigationTable() {
  try {
    // Drop table if exists (for development)
    await sql`DROP TABLE IF EXISTS navigation_menu CASCADE`;
    
    // Create navigation_menu table
    await sql`
      CREATE TABLE navigation_menu (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        href VARCHAR(255) NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        parent_id INTEGER REFERENCES navigation_menu(id) ON DELETE CASCADE,
        icon VARCHAR(50),
        target VARCHAR(20) DEFAULT '_self',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Navigation menu table created successfully');
    
    // Insert sample menu items
    await sql`
      INSERT INTO navigation_menu (title, href, order_index, is_active) VALUES
      ('Ana Sayfa', '/', 1, true),
      ('AI Asistan', '/ai', 2, true),
      ('İletişim', '/contact', 3, true),
      ('Hakkımızda', '/about', 4, true),
      ('Hizmetler', '/services', 5, true)
    `;
    
    console.log('✅ Sample menu items inserted successfully');
    
    // Query and display the menu items
    const menuItems = await sql`
      SELECT * FROM navigation_menu 
      WHERE is_active = true AND parent_id IS NULL
      ORDER BY order_index ASC
    `;
    
    console.log('📋 Current menu items:');
    console.table(menuItems);
    
  } catch (error) {
    console.error('❌ Error setting up navigation table:', error);
    process.exit(1);
  }
}

setupNavigationTable().then(() => {
  console.log('✅ Setup completed successfully');
  process.exit(0);
});