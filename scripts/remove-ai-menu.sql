-- AI Asistan menü öğesini devre dışı bırak
UPDATE navigation_menu 
SET is_active = false 
WHERE href = '/ai';

-- Blog'un order_index'ini 2 yap
UPDATE navigation_menu 
SET order_index = 2 
WHERE href = '/blog';

-- İletişim'in order_index'ini 3 yap
UPDATE navigation_menu 
SET order_index = 3 
WHERE href = '/contact';

-- Güncel aktif menü öğelerini göster
SELECT * FROM navigation_menu 
WHERE is_active = true 
ORDER BY order_index ASC;