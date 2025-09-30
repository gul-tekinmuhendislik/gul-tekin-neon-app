-- Update existing water purification visual elements to focus on home use
UPDATE visual_elements 
SET 
    name = 'Ev Tipi Su Arıtma Cihazı',
    description = 'Tezgah altı su arıtma cihazı, kompakt tasarım, kolay filtre değiştirme, şık görünüm',
    weight = 150
WHERE name = 'Crystal Filters' AND topic_key = 'water_purification';

UPDATE visual_elements 
SET 
    name = 'Aile Sağlığı İçin Su',
    description = 'Aile bireylerinin güvenle su içmesi, bebek maması hazırlama, sağlıklı içme suyu tüketimi',
    weight = 140
WHERE name = 'Nano Filtration' AND topic_key = 'water_purification';

UPDATE visual_elements 
SET 
    name = 'Mutfakta Pratik Kullanım',
    description = 'Çay/kahve yapımı, yemek pişirme suyu, buzdolabına entegre su arıtma çözümleri',
    weight = 130
WHERE name = 'Water Flow' AND topic_key = 'water_purification';

UPDATE visual_elements 
SET 
    name = 'Su Kalitesi Göstergeleri',
    description = 'Basit LED göstergeler, filtre ömrü, su kalitesi, akıllı telefon uyumlu arayüz',
    weight = 120
WHERE name = 'System Monitoring' AND topic_key = 'water_purification';

-- Add new home-focused visual elements
INSERT INTO visual_elements (name, topic_key, element_type, description, weight) VALUES
('Tasarruf ve Çevre', 'water_purification', 'abstract', 'Plastik şişe kullanımının azalması, ev ekonomisine katkı, çevre dostu filtreler', 110),
('Modern Mutfak Tasarımı', 'water_purification', 'concrete', 'Modern mutfaklara uyumlu şık su arıtma cihazı tasarımları, paslanmaz çelik detaylar', 100);

-- Update or add keywords for home water purification
UPDATE regional_themes 
SET 
    keywords = '["ev tipi su arıtma", "aile sağlığı", "pratik filtre çözümleri", "ekonomik su arıtma", "sağlıklı içme suyu"]'::jsonb
WHERE region_key IN ('bodrum', 'milas');

-- Update negative prompts to remove industrial elements if they exist
UPDATE negative_prompts 
SET is_active = false 
WHERE prompt_text LIKE '%factory%' 
   OR prompt_text LIKE '%industrial%' 
   OR prompt_text LIKE '%plant%';

-- Add new negative prompts specific to home water purification
INSERT INTO negative_prompts (category, prompt_text, severity, is_active) VALUES
('content', 'no industrial settings, no factories, no warehouses, no industrial equipment', 3, true),
('style', 'no technical diagrams, no complex machinery, no industrial aesthetics', 2, true);
