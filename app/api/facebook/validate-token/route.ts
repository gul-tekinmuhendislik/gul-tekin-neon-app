import { NextResponse } from "next/server";
import { getActiveFacebookToken } from "@/lib/token-manager";

export async function GET() {
  try {
    // Get token from database
    const dbToken = await getActiveFacebookToken();
    
    if (!dbToken || !dbToken.access_token) {
      return NextResponse.json({
        success: false,
        error: "No token found in database"
      });
    }
    
    console.log("Testing token from database...");
    console.log("Token preview:", `${dbToken.access_token.substring(0, 20)}...`);
    
    // Method 1: Try debug_token endpoint
    const debugUrl = `https://graph.facebook.com/v23.0/debug_token?input_token=${dbToken.access_token}&access_token=${dbToken.access_token}`;
    
    console.log("Calling Facebook debug_token API...");
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();
    
    console.log("Debug response status:", debugResponse.status);
    console.log("Debug response data:", JSON.stringify(debugData, null, 2));
    
    // Method 2: Try to get page info directly
    const pageUrl = `https://graph.facebook.com/v23.0/${dbToken.page_id}?fields=name,id&access_token=${dbToken.access_token}`;
    
    console.log("Calling Facebook page API...");
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    
    console.log("Page response status:", pageResponse.status);
    console.log("Page response data:", JSON.stringify(pageData, null, 2));
    
    // Method 3: Try me endpoint
    const meUrl = `https://graph.facebook.com/v23.0/me?access_token=${dbToken.access_token}`;
    
    console.log("Calling Facebook me API...");
    const meResponse = await fetch(meUrl);
    const meData = await meResponse.json();
    
    console.log("Me response status:", meResponse.status);
    console.log("Me response data:", JSON.stringify(meData, null, 2));
    
    return NextResponse.json({
      success: true,
      tokenInfo: {
        page_id: dbToken.page_id,
        page_name: dbToken.page_name,
        expires_at: dbToken.expires_at,
        token_preview: `${dbToken.access_token.substring(0, 20)}...${dbToken.access_token.substring(dbToken.access_token.length - 20)}`
      },
      validation: {
        debug_token: {
          status: debugResponse.status,
          ok: debugResponse.ok,
          data: debugData
        },
        page_info: {
          status: pageResponse.status,
          ok: pageResponse.ok,
          data: pageData
        },
        me_endpoint: {
          status: meResponse.status,
          ok: meResponse.ok,
          data: meData
        }
      }
    });
    
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}