-- Add metadata column to event_logs table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'event_logs' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE event_logs 
        ADD COLUMN metadata JSONB DEFAULT '{}';
        
        COMMENT ON COLUMN event_logs.metadata IS 'Additional metadata for the event';
    END IF;
END $$;