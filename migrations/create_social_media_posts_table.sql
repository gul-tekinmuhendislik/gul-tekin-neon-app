-- Create social_media_posts table for tracking social media posts
CREATE TABLE IF NOT EXISTS social_media_posts (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- facebook, twitter, linkedin, instagram
  post_id VARCHAR(255), -- Platform-specific post ID
  post_data JSONB NOT NULL, -- Full post data (message, link, hashtags, etc.)
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, published, scheduled, failed
  posted_at TIMESTAMP WITH TIME ZONE, -- When the post was published
  scheduled_for TIMESTAMP WITH TIME ZONE, -- For scheduled posts
  error_message TEXT, -- Error details if posting failed
  engagement_metrics JSONB, -- likes, shares, comments, reach (updated periodically)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one post per content per platform
  UNIQUE(content_id, platform)
);

-- Create indexes for better query performance
CREATE INDEX idx_social_media_posts_content_id ON social_media_posts(content_id);
CREATE INDEX idx_social_media_posts_platform ON social_media_posts(platform);
CREATE INDEX idx_social_media_posts_status ON social_media_posts(status);
CREATE INDEX idx_social_media_posts_posted_at ON social_media_posts(posted_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_social_media_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER social_media_posts_updated_at
  BEFORE UPDATE ON social_media_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_social_media_posts_updated_at();

-- Add comment to table
COMMENT ON TABLE social_media_posts IS 'Tracks all social media posts for generated content';
COMMENT ON COLUMN social_media_posts.content_id IS 'Reference to the generated content';
COMMENT ON COLUMN social_media_posts.platform IS 'Social media platform (facebook, twitter, etc.)';
COMMENT ON COLUMN social_media_posts.post_id IS 'Platform-specific post identifier';
COMMENT ON COLUMN social_media_posts.post_data IS 'Complete post data including message, links, hashtags';
COMMENT ON COLUMN social_media_posts.status IS 'Current status of the post';
COMMENT ON COLUMN social_media_posts.engagement_metrics IS 'Social media engagement metrics (likes, shares, etc.)';