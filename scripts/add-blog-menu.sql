-- Blog menü öğesini ekle
INSERT INTO navigation_menu (title, href, order_index, is_active) 
VALUES ('Blog', '/blog', 3, true)
ON CONFLICT DO NOTHING;

-- İletişim'in order_index'ini güncelle
UPDATE navigation_menu 
SET order_index = 4 
WHERE href = '/contact';

-- Güncel menü öğelerini göster
SELECT * FROM navigation_menu 
WHERE is_active = true 
ORDER BY order_index ASC;