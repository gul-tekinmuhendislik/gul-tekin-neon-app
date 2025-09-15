-- Create color_schemes table for dynamic color management
CREATE TABLE IF NOT EXISTS color_schemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    topic_key VARCHAR(100), -- e.g., 'water_purification', 'heat_pump', etc.
    primary_gradient JSONB NOT NULL, -- Array of 4 colors for gradient
    accent_colors JSONB, -- Additional accent colors
    emotion_description TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_color_schemes_topic_key ON color_schemes(topic_key);
CREATE INDEX idx_color_schemes_is_active ON color_schemes(is_active);

-- Insert neon color palettes
INSERT INTO color_schemes (name, topic_key, primary_gradient, accent_colors, emotion_description) VALUES
-- Water Purification - Cyan/Blue Neon
('Neon Aqua', 'water_purification',
 '["#00FFFF", "#0EA5E9", "#006FFF", "#0033CC"]'::jsonb,
 '["#10F4B1", "#00D4FF"]'::jsonb,
 'Evoking crystal clarity with electric cyan and deep ocean blues'),

-- Heat Pump - Orange/Blue Thermal Neon
('Thermal Neon', 'heat_pump',
 '["#FF6B00", "#FF3366", "#0088FF", "#00CCFF"]'::jsonb,
 '["#FF00FF", "#FFAA00"]'::jsonb,
 'Dynamic thermal contrast with hot orange and cool blue neons'),

-- Solar Panel - Yellow/Purple Electric
('Solar Electric', 'solar_panel',
 '["#FFFF00", "#FFD700", "#9933FF", "#6600FF"]'::jsonb,
 '["#00FF00", "#FF00AA"]'::jsonb,
 'Vibrant solar energy with electric yellow and purple plasma'),

-- Neon Signage - Pink/Purple Classic Neon
('Classic Neon', 'neon_signage',
 '["#FF10F0", "#FF00AA", "#AA00FF", "#7700FF"]'::jsonb,
 '["#00FFAA", "#FFAA00"]'::jsonb,
 'Iconic neon glow with hot pink and electric purple'),

-- LED Display - RGB Spectrum
('RGB Spectrum', 'led_display',
 '["#FF0000", "#00FF00", "#0000FF", "#FF00FF"]'::jsonb,
 '["#00FFFF", "#FFFF00"]'::jsonb,
 'Full RGB spectrum representing digital display technology'),

-- Air Conditioning - Cool Blue/Mint Neon
('Arctic Neon', 'air_conditioning',
 '["#00FFCC", "#00CCFF", "#0099FF", "#0066FF"]'::jsonb,
 '["#00FF99", "#99FFFF"]'::jsonb,
 'Refreshing arctic tones with mint and ice blue neons'),

-- Underfloor Heating - Warm Red/Orange Glow
('Thermal Glow', 'underfloor_heating',
 '["#FF3300", "#FF6600", "#FF9900", "#FFCC00"]'::jsonb,
 '["#FF0066", "#FFFF33"]'::jsonb,
 'Warm radiant heat with glowing orange and red tones'),

-- Water Booster - Pressure Blue/Green
('Pressure Wave', 'water_booster',
 '["#00FF66", "#00CCFF", "#0099CC", "#006699"]'::jsonb,
 '["#33FF99", "#66FFFF"]'::jsonb,
 'High-pressure dynamics with aqua green and ocean blue'),

-- Default Neon Tech
('Tech Neon Default', 'default',
 '["#00D4FF", "#FF00D4", "#D4FF00", "#FF7700"]'::jsonb,
 '["#00FF88", "#8800FF"]'::jsonb,
 'Universal tech aesthetic with balanced neon spectrum'),

-- Special: Bodrum Edition - Mediterranean Neon
('Bodrum Neon', 'bodrum_special',
 '["#00E5FF", "#00B4D8", "#FF6B9D", "#FFC75F"]'::jsonb,
 '["#95E1D3", "#F38181"]'::jsonb,
 'Mediterranean vibes with turquoise sea and sunset neons'),

-- Special: Industrial Neon
('Industrial Neon', 'industrial',
 '["#FFB700", "#FF6B00", "#00D9FF", "#0099CC"]'::jsonb,
 '["#FF0055", "#00FF99"]'::jsonb,
 'Industrial strength with warning orange and safety blue neons');

-- Function to get random active color scheme
CREATE OR REPLACE FUNCTION get_random_color_scheme(topic_input VARCHAR DEFAULT NULL)
RETURNS TABLE(
    id INT,
    name VARCHAR,
    primary_gradient JSONB,
    accent_colors JSONB,
    emotion_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT cs.id, cs.name, cs.primary_gradient, cs.accent_colors, cs.emotion_description
    FROM color_schemes cs
    WHERE cs.is_active = true
    AND (topic_input IS NULL OR cs.topic_key = topic_input OR cs.topic_key = 'default')
    ORDER BY
        CASE
            WHEN cs.topic_key = topic_input THEN 0
            WHEN cs.topic_key = 'default' THEN 2
            ELSE 1
        END,
        RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get all colors for a topic
CREATE OR REPLACE FUNCTION get_topic_colors(topic_input VARCHAR)
RETURNS TABLE(
    id INT,
    name VARCHAR,
    primary_gradient JSONB,
    accent_colors JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT cs.id, cs.name, cs.primary_gradient, cs.accent_colors
    FROM color_schemes cs
    WHERE cs.is_active = true
    AND (cs.topic_key = topic_input OR cs.topic_key = 'default')
    ORDER BY
        CASE WHEN cs.topic_key = topic_input THEN 0 ELSE 1 END,
        cs.id;
END;
$$ LANGUAGE plpgsql;