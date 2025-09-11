const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function updateNavigation() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Update navigation to point to /hizmetler
    const result = await sql`
      UPDATE navigation_menu 
      SET href = '/hizmetler' 
      WHERE href = '/services'
      RETURNING *
    `;
    
    console.log('Navigation updated:', result);
    
    // Also add Markalar to navigation if not exists
    const checkMarkalar = await sql`
      SELECT * FROM navigation_menu WHERE href = '/markalar'
    `;
    
    if (checkMarkalar.length === 0) {
      const addMarkalar = await sql`
        INSERT INTO navigation_menu (title, href, order_index, is_active)
        VALUES ('Markalar', '/markalar', 6, true)
        RETURNING *
      `;
      console.log('Markalar added to navigation:', addMarkalar);
    }
    
  } catch (error) {
    console.error('Error updating navigation:', error);
  }
}

updateNavigation();