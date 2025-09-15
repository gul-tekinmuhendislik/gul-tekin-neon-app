-- 1. VISUAL ELEMENTS TABLE
CREATE TABLE IF NOT EXISTS visual_elements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    topic_key VARCHAR(100),
    element_type VARCHAR(50) NOT NULL, -- 'concrete', 'abstract', 'technical'
    description TEXT NOT NULL,
    weight INTEGER DEFAULT 100, -- Selection weight for randomization
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. COMPOSITION RULES TABLE
CREATE TABLE IF NOT EXISTS composition_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    layout_type VARCHAR(100),
    layout_description TEXT,
    focal_point TEXT,
    spacing_rules TEXT,
    depth_layers TEXT,
    margin_rules TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. STYLE PRESETS TABLE
CREATE TABLE IF NOT EXISTS style_presets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50), -- 'modern', 'retro', 'futuristic', 'artistic'
    main_style TEXT NOT NULL,
    effects JSONB, -- Array of effects
    render_style VARCHAR(100),
    atmosphere TEXT,
    technical_specs TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. REGIONAL THEMES TABLE
CREATE TABLE IF NOT EXISTS regional_themes (
    id SERIAL PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL,
    region_key VARCHAR(100) UNIQUE,
    visual_elements TEXT,
    cultural_motifs TEXT,
    seasonal_variants JSONB,
    keywords JSONB, -- Trigger keywords
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. NEGATIVE PROMPTS TABLE
CREATE TABLE IF NOT EXISTS negative_prompts (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'quality', 'style', 'content', 'technical'
    prompt_text TEXT NOT NULL,
    severity INTEGER DEFAULT 1, -- 1-3 (low to high importance)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. PROMPT TEMPLATES TABLE (Master templates)
CREATE TABLE IF NOT EXISTS prompt_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    template_type VARCHAR(50), -- 'hero', 'product', 'technical', 'artistic'
    base_template TEXT NOT NULL,
    variable_slots JSONB, -- Defines which parts can be replaced
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample visual elements
INSERT INTO visual_elements (name, topic_key, element_type, description, weight) VALUES
-- Water Purification
('Crystal Filters', 'water_purification', 'concrete', 'transparent filtration chambers with visible sediment layers, reverse osmosis membrane cross-section', 150),
('Nano Filtration', 'water_purification', 'concrete', 'microscopic view of carbon nanotubes filtering water molecules, UV sterilization chamber glowing', 100),
('Water Flow', 'water_purification', 'abstract', 'flowing water ribbons through geometric filter shapes, droplet particles becoming diamonds', 120),
('Purification Waves', 'water_purification', 'abstract', 'wave patterns transforming from dark to crystal clear, spiral vortex of purification', 100),
('Technical Diagram', 'water_purification', 'technical', '5-stage filter array (sediment→GAC→CTO→membrane→carbon), pressure gauges, flow indicators', 100),
('System Monitoring', 'water_purification', 'technical', 'digital dashboard showing TDS levels, pH meters, flow rate graphs, real-time water quality metrics', 80),

-- Heat Pump
('Thermal Coils', 'heat_pump', 'concrete', 'copper coil spirals with frost and heat zones, compressor unit cutaway', 120),
('Heat Exchange', 'heat_pump', 'concrete', 'split view of indoor/outdoor units, refrigerant pipes with temperature gradients', 100),
('Energy Waves', 'heat_pump', 'abstract', 'temperature gradient waves, hot/cold particle streams, infinity loop energy cycle', 110),
('Thermal Fields', 'heat_pump', 'abstract', 'heat map visualization, thermodynamic flow patterns, energy transformation spirals', 90),

-- Solar Panel
('PV Grid', 'solar_panel', 'concrete', 'photovoltaic cell grid with sunlight rays, silicon wafers, inverter box with LED indicators', 130),
('Solar Array', 'solar_panel', 'concrete', 'rooftop solar installation, tracking system following sun path, battery storage units', 100),
('Sun Energy', 'solar_panel', 'abstract', 'sun rays morphing into electrical circuits, energy particles flowing through panel matrix', 120),
('Photon Dance', 'solar_panel', 'abstract', 'photons converting to electrons visualization, quantum energy transfer patterns', 80);

-- Insert composition rules
INSERT INTO composition_rules (name, layout_type, layout_description, focal_point, spacing_rules, depth_layers, margin_rules) VALUES
('Golden Ratio', 'asymmetrical', '60/40 visual weight distribution', 'primary element at golden ratio intersection (left third)', '30% negative space on right for headlines', '3-layer depth: background, main, foreground', '10% safe area from edges'),
('Rule of Thirds', 'grid-based', 'elements aligned to thirds grid', 'main subject on intersection points', 'balanced spacing between elements', 'foreground/midground/background separation', '15% margins for flexibility'),
('Central Hero', 'symmetrical', 'centered composition with radial balance', 'strong central focal point', '20% breathing room around center', 'radial depth from center outward', '5% minimal margins'),
('Dynamic Diagonal', 'diagonal', 'diagonal flow from bottom-left to top-right', 'key element along diagonal line', 'dynamic tension through diagonal placement', 'overlapping depth layers', '12% adaptive margins');

-- Insert style presets
INSERT INTO style_presets (name, category, main_style, effects, render_style, atmosphere, technical_specs) VALUES
('Neon Modern', 'modern', 'Modern editorial vector illustration with neon accents',
 '["glass morphism", "neon glow", "subtle gradients"]'::jsonb,
 'flat design with depth',
 'professional yet vibrant, conveying innovation',
 'high contrast for text overlay, scalable vectors'),

('Cyberpunk Tech', 'futuristic', 'Cyberpunk aesthetic with holographic elements',
 '["holographic shimmer", "glitch effects", "neon outlines"]'::jsonb,
 'dark with bright accents',
 'high-tech dystopian with electric energy',
 'HDR lighting, chromatic aberration touches'),

('Clean Minimal', 'modern', 'Minimalist design with focus on clarity',
 '["soft shadows", "subtle animations", "clean lines"]'::jsonb,
 'ultra-clean vectors',
 'serene and professional, trustworthy',
 'maximum readability, mobile-optimized'),

('Retro Neon', 'retro', '80s inspired retrowave aesthetic',
 '["synthwave gradients", "retro grid", "neon trails"]'::jsonb,
 'nostalgic neon style',
 'nostalgic yet modern, energetic vibes',
 'vintage color palettes with modern rendering');

-- Insert regional themes
INSERT INTO regional_themes (region_name, region_key, visual_elements, cultural_motifs, seasonal_variants, keywords) VALUES
('Bodrum', 'bodrum',
 'Mediterranean villa silhouettes, yacht marina hints, turquoise sea gradients',
 'white cubic architecture, bougainvillea accents, windmill shapes',
 '{"summer": "bright sunny atmosphere", "winter": "calm seas and clear skies"}'::jsonb,
 '["bodrum", "muğla", "ege"]'::jsonb),

('Milas', 'milas',
 'olive tree branches, ancient stone patterns, rural landscape hints',
 'traditional carpet motifs, terracotta accents, agricultural elements',
 '{"harvest": "golden wheat fields", "spring": "olive blossoms"}'::jsonb,
 '["milas", "söke", "didim"]'::jsonb),

('Industrial Zone', 'industrial',
 'factory silhouettes, warehouse structures, logistics elements',
 'warning stripes, safety symbols, industrial equipment',
 '{"day": "busy productive atmosphere", "night": "illuminated facilities"}'::jsonb,
 '["sanayi", "osb", "fabrika"]'::jsonb);

-- Insert negative prompts
INSERT INTO negative_prompts (category, prompt_text, severity) VALUES
('quality', 'no low quality, no pixelated, no blurry, no artifacts, no compression', 3),
('content', 'no text, no typography, no letters, no numbers, no logos, no watermarks', 3),
('style', 'no photorealistic, no cartoon, no anime, no sketch, no hand-drawn', 2),
('people', 'no human figures, no faces, no hands, no body parts', 2),
('composition', 'no cluttered, no busy patterns, no chaotic layout, no overlapping text areas', 2),
('color', 'no muddy colors, no oversaturation, no low contrast, no color bleeding', 1),
('generic', 'no stock photo aesthetics, no generic clip art, no cliché imagery', 1);

-- Create indexes for better performance
CREATE INDEX idx_visual_elements_topic ON visual_elements(topic_key);
CREATE INDEX idx_visual_elements_type ON visual_elements(element_type);
CREATE INDEX idx_composition_rules_active ON composition_rules(is_active);
CREATE INDEX idx_style_presets_category ON style_presets(category);
CREATE INDEX idx_regional_themes_key ON regional_themes(region_key);
CREATE INDEX idx_negative_prompts_category ON negative_prompts(category);