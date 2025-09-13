import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Twitter tokens tablosunu oluştur
    await sql`
      CREATE TABLE IF NOT EXISTS twitter_tokens (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        username VARCHAR(100) NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        scope TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Twitter posts log tablosu
    await sql`
      CREATE TABLE IF NOT EXISTS twitter_posts (
        id SERIAL PRIMARY KEY,
        tweet_id VARCHAR(100),
        content TEXT NOT NULL,
        media_urls TEXT[],
        post_type VARCHAR(50),
        related_content_id INTEGER,
        related_content_type VARCHAR(50),
        engagement JSONB,
        posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'posted'
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Twitter tables created successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tables' },
      { status: 500 }
    );
  }
}