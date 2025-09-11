import { NextResponse } from "next/server";
import { getActiveFacebookToken } from "@/lib/token-manager";

export async function GET() {
  try {
    console.log("=== Facebook Debug ===");
    
    // Step 1: Check environment variables
    const envVars = {
      FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID ? "Set" : "Not set",
      FACEBOOK_PAGE_ACCESS_TOKEN: process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? "Set" : "Not set",
      pageId: process.env.FACEBOOK_PAGE_ID,
      tokenLength: process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.length || 0
    };
    console.log("Environment variables:", envVars);
    
    // Step 2: Try to get token from database
    console.log("Attempting to get token from database...");
    const dbToken = await getActiveFacebookToken();
    console.log("Database token result:", dbToken ? "Found" : "Not found");
    
    if (dbToken) {
      console.log("Token details:", {
        page_id: dbToken.page_id,
        page_name: dbToken.page_name,
        expires_at: dbToken.expires_at,
        has_access_token: !!dbToken.access_token,
        token_length: dbToken.access_token?.length || 0
      });
    }
    
    // Step 3: Try the full getFacebookPageAccessToken function
    const { getFacebookPageAccessToken } = await import("@/lib/facebook-api");
    console.log("Calling getFacebookPageAccessToken...");
    const credentials = await getFacebookPageAccessToken();
    console.log("Credentials result:", credentials ? "Found" : "Not found");
    
    if (credentials) {
      console.log("Credentials details:", {
        pageId: credentials.pageId,
        hasToken: !!credentials.accessToken,
        tokenLength: credentials.accessToken?.length || 0
      });
    }
    
    return NextResponse.json({
      success: true,
      envVars: {
        ...envVars,
        FACEBOOK_PAGE_ACCESS_TOKEN: envVars.FACEBOOK_PAGE_ACCESS_TOKEN // Don't expose actual token
      },
      dbToken: dbToken ? {
        found: true,
        page_id: dbToken.page_id,
        page_name: dbToken.page_name,
        expires_at: dbToken.expires_at,
        has_access_token: !!dbToken.access_token,
        token_preview: dbToken.access_token ? 
          `${dbToken.access_token.substring(0, 10)}...${dbToken.access_token.substring(dbToken.access_token.length - 10)}` : 
          null
      } : { found: false },
      credentials: credentials ? {
        found: true,
        pageId: credentials.pageId,
        hasToken: !!credentials.accessToken,
        token_preview: credentials.accessToken ? 
          `${credentials.accessToken.substring(0, 10)}...${credentials.accessToken.substring(credentials.accessToken.length - 10)}` : 
          null
      } : { found: false }
    });
    
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}