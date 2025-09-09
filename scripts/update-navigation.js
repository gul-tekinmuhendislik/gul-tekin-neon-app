import { sql } from '../lib/db.js';

async function updateNavigation() {
  try {
    console.log('AI Asistan menü öğesi devre dışı bırakılıyor...');
    
    // AI Asistan menü öğesini devre dışı bırak
    await sql`
      UPDATE navigation_menu 
      SET is_active = false 
      WHERE href = '/ai'
    `;
    
    // Blog'un order_index'ini 2 yap
    await sql`
      UPDATE navigation_menu 
      SET order_index = 2 
      WHERE href = '/blog'
    `;
    
    // İletişim'in order_index'ini 3 yap
    await sql`
      UPDATE navigation_menu 
      SET order_index = 3 
      WHERE href = '/contact'
    `;
    
    // Güncel aktif menü öğelerini göster
    const activeMenuItems = await sql`
      SELECT * FROM navigation_menu 
      WHERE is_active = true 
      ORDER BY order_index ASC
    `;
    
    console.log('Güncel aktif menü öğeleri:');
    console.table(activeMenuItems);
    
    console.log('✅ Navigasyon başarıyla güncellendi!');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

updateNavigation();