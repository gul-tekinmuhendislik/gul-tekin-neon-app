import { NextResponse } from "next/server";
import { saveFacebookToken } from "@/lib/token-manager";
import { sql } from "@/lib/db";

export async function POST() {
  try {
    // Get fresh token from environment
    const freshToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;
    
    if (!freshToken || !pageId) {
      return NextResponse.json({
        success: false,
        error: "No Facebook credentials in environment variables"
      });
    }
    
    console.log("Fresh token from env:", `${freshToken.substring(0, 20)}...`);
    
    // First, clear old tokens
    await sql`
      UPDATE social_tokens 
      SET is_active = false 
      WHERE platform = 'facebook' 
      AND token_type = 'page_access_token'
    `;
    
    console.log("Cleared old tokens");
    
    // Set expiry date (60 days from now for long-lived tokens)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);
    
    // Save new token
    const saved = await saveFacebookToken(
      freshToken,
      pageId,
      "Gül-tekin Mühendislik",
      expiresAt
    );
    
    if (!saved) {
      return NextResponse.json({
        success: false,
        error: "Failed to save token to database"
      });
    }
    
    console.log("Token saved successfully");
    
    // Verify the new token works
    const testUrl = `https://graph.facebook.com/v23.0/${pageId}?fields=name,id&access_token=${freshToken}`;
    const testResponse = await fetch(testUrl);
    const testData = await testResponse.json();
    
    return NextResponse.json({
      success: true,
      message: "Token updated successfully",
      tokenInfo: {
        page_id: pageId,
        expires_at: expiresAt,
        token_preview: `${freshToken.substring(0, 20)}...${freshToken.substring(freshToken.length - 20)}`
      },
      validation: {
        status: testResponse.status,
        ok: testResponse.ok,
        pageData: testData
      }
    });
    
  } catch (error) {
    console.error("Token update error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}