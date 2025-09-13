-- Google Business token'ları için tablo
CREATE TABLE IF NOT EXISTS google_tokens (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL DEFAULT 'google_business',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(platform)
);

-- Google Business lokasyonları için tablo
CREATE TABLE IF NOT EXISTS google_business_locations (
  id SERIAL PRIMARY KEY,
  location_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  title VARCHAR(255),
  address JSONB,
  phone_number VARCHAR(50),
  website_uri TEXT,
  categories JSONB,
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Google Business yorumları için tablo
CREATE TABLE IF NOT EXISTS google_business_reviews (
  id SERIAL PRIMARY KEY,
  review_id VARCHAR(255) UNIQUE NOT NULL,
  location_id VARCHAR(255) NOT NULL,
  reviewer_name VARCHAR(255),
  rating INTEGER,
  comment TEXT,
  review_time TIMESTAMP,
  reply_comment TEXT,
  reply_time TIMESTAMP,
  auto_replied BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES google_business_locations(location_id) ON DELETE CASCADE
);

-- Google Business istatistikleri için tablo
CREATE TABLE IF NOT EXISTS google_business_insights (
  id SERIAL PRIMARY KEY,
  location_id VARCHAR(255) NOT NULL,
  metric_date DATE NOT NULL,
  queries_direct INTEGER DEFAULT 0,
  queries_indirect INTEGER DEFAULT 0,
  views_maps INTEGER DEFAULT 0,
  views_search INTEGER DEFAULT 0,
  actions_website INTEGER DEFAULT 0,
  actions_phone INTEGER DEFAULT 0,
  actions_directions INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(location_id, metric_date),
  FOREIGN KEY (location_id) REFERENCES google_business_locations(location_id) ON DELETE CASCADE
);

-- Google Business gönderileri için tablo
CREATE TABLE IF NOT EXISTS google_business_posts (
  id SERIAL PRIMARY KEY,
  post_id VARCHAR(255) UNIQUE NOT NULL,
  location_id VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  summary TEXT,
  call_to_action JSONB,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES google_business_locations(location_id) ON DELETE CASCADE
);

-- Indexler
CREATE INDEX idx_google_reviews_location ON google_business_reviews(location_id);
CREATE INDEX idx_google_reviews_rating ON google_business_reviews(rating);
CREATE INDEX idx_google_reviews_review_time ON google_business_reviews(review_time);
CREATE INDEX idx_google_insights_location ON google_business_insights(location_id);
CREATE INDEX idx_google_insights_date ON google_business_insights(metric_date);
CREATE INDEX idx_google_posts_location ON google_business_posts(location_id);
CREATE INDEX idx_google_posts_status ON google_business_posts(status);