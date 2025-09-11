import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getActiveFacebookToken } from "@/lib/token-manager";

export async function GET() {
  try {
    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'social_tokens'
      );
    `;
    
    console.log("Table exists:", tableCheck[0].exists);
    
    if (!tableCheck[0].exists) {
      // Create the table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS social_tokens (
          id SERIAL PRIMARY KEY,
          platform VARCHAR(50) NOT NULL,
          token_type VARCHAR(50) NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          page_id VARCHAR(255),
          page_name VARCHAR(255),
          expires_at TIMESTAMP WITH TIME ZONE,
          scopes TEXT[],
          metadata JSONB,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(platform, token_type)
        );
      `;
      console.log("Created social_tokens table");
    }
    
    // Check for existing tokens
    const tokens = await sql`
      SELECT 
        id,
        platform,
        token_type,
        page_id,
        page_name,
        expires_at,
        is_active,
        created_at
      FROM social_tokens
      WHERE platform = 'facebook'
    `;
    
    console.log("Existing tokens:", tokens);
    
    // Try to get active token
    const activeToken = await getActiveFacebookToken();
    console.log("Active token found:", !!activeToken);
    
    // Get environment variables status
    const envStatus = {
      hasPageId: !!process.env.FACEBOOK_PAGE_ID,
      hasPageToken: !!process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      hasAppId: !!process.env.FACEBOOK_APP_ID,
      hasAppSecret: !!process.env.FACEBOOK_APP_SECRET
    };
    
    return NextResponse.json({
      success: true,
      tableExists: tableCheck[0].exists,
      tokensInDb: tokens.length,
      tokens: tokens.map(t => ({
        ...t,
        access_token: t.access_token ? "***hidden***" : null
      })),
      activeToken: activeToken ? {
        page_id: activeToken.page_id,
        page_name: activeToken.page_name,
        expires_at: activeToken.expires_at,
        is_active: activeToken.is_active
      } : null,
      envStatus
    });
    
  } catch (error) {
    console.error("Database check error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}