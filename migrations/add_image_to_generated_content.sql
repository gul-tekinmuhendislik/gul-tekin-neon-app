-- Add image column to generated_content table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'generated_content' 
        AND column_name = 'image'
    ) THEN
        ALTER TABLE generated_content 
        ADD COLUMN image TEXT DEFAULT NULL;
        
        COMMENT ON COLUMN generated_content.image IS 'Featured image URL for the blog post';
    END IF;
END $$;