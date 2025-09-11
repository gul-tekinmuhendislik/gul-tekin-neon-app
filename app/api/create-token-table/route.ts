import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Create social_tokens table to store access tokens
    await sql`
      CREATE TABLE IF NOT EXISTS social_tokens (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        token_type VARCHAR(50) NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        page_id VARCHAR(255),
        page_name VARCHAR(255),
        expires_at TIMESTAMP,
        scopes TEXT[],
        metadata JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(platform, token_type)
      )
    `;

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_social_tokens_platform 
      ON social_tokens(platform, is_active)
    `;

    // Create index on expires_at for token refresh queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_social_tokens_expires 
      ON social_tokens(expires_at)
      WHERE is_active = true
    `;

    // Insert or update the current Facebook token
    const FACEBOOK_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
    
    if (FACEBOOK_TOKEN && FACEBOOK_PAGE_ID) {
      // Token expires in 60 days for page access tokens
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60);
      
      await sql`
        INSERT INTO social_tokens (
          platform,
          token_type,
          access_token,
          page_id,
          page_name,
          expires_at,
          scopes,
          metadata
        ) VALUES (
          'facebook',
          'page_access_token',
          ${FACEBOOK_TOKEN},
          ${FACEBOOK_PAGE_ID},
          'Gül-tekin Mühendislik',
          ${expiresAt},
          ARRAY['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
          ${JSON.stringify({
            addedBy: 'system',
            source: 'env_variable',
            createdAt: new Date().toISOString()
          })}
        )
        ON CONFLICT (platform, token_type) 
        DO UPDATE SET
          access_token = ${FACEBOOK_TOKEN},
          page_id = ${FACEBOOK_PAGE_ID},
          expires_at = ${expiresAt},
          updated_at = CURRENT_TIMESTAMP,
          is_active = true
      `;
    }

    // Create token_refresh_logs table for tracking refresh attempts
    await sql`
      CREATE TABLE IF NOT EXISTS token_refresh_logs (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        token_id INTEGER REFERENCES social_tokens(id),
        refresh_status VARCHAR(20) NOT NULL,
        old_expires_at TIMESTAMP,
        new_expires_at TIMESTAMP,
        error_message TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Get current tokens info
    const tokens = await sql`
      SELECT 
        platform,
        token_type,
        page_id,
        page_name,
        expires_at,
        is_active,
        created_at,
        updated_at
      FROM social_tokens
      WHERE is_active = true
    `;

    return NextResponse.json({
      success: true,
      message: "Token tables created successfully",
      tokens: tokens,
      tables: [
        "social_tokens",
        "token_refresh_logs"
      ]
    });

  } catch (error) {
    console.error("Error creating token tables:", error);
    return NextResponse.json(
      { 
        error: "Failed to create token tables", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}