-- Add metadata column to generated_content table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'generated_content' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE generated_content 
        ADD COLUMN metadata JSONB DEFAULT '{}';
        
        COMMENT ON COLUMN generated_content.metadata IS 'Additional metadata for content (E-E-A-T analysis, SEO, social media, etc.)';
    END IF;
END $$;