-- Add prompt column to generated_content table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'generated_content' 
        AND column_name = 'prompt'
    ) THEN
        ALTER TABLE generated_content 
        ADD COLUMN prompt TEXT DEFAULT NULL;
        
        COMMENT ON COLUMN generated_content.prompt IS 'The prompt used to generate this content';
    END IF;
END $$;