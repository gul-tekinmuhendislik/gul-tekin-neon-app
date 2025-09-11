import { NextResponse } from "next/server";
import { 
  getActiveFacebookToken, 
  getTokenExpiryInfo,
  checkTokenNeedsRefresh 
} from "@/lib/token-manager";
import { getFacebookPageAccessToken } from "@/lib/facebook-api";

export async function GET() {
  try {
    console.log("Testing token manager...");
    
    // Test 1: Get active token from database
    const dbToken = await getActiveFacebookToken();
    
    // Test 2: Get token through Facebook API (which uses DB first)
    const apiToken = await getFacebookPageAccessToken();
    
    // Test 3: Get token expiry info
    const expiryInfo = await getTokenExpiryInfo();
    
    // Test 4: Check if needs refresh
    const needsRefresh = await checkTokenNeedsRefresh();
    
    // Test 5: Validate token with Facebook
    let tokenValidation = null;
    if (apiToken) {
      const debugUrl = `https://graph.facebook.com/v23.0/debug_token?` +
        `input_token=${apiToken.accessToken}&` +
        `access_token=${apiToken.accessToken}`;
      
      const debugResponse = await fetch(debugUrl);
      const debugData = await debugResponse.json();
      
      tokenValidation = {
        isValid: debugData.data?.is_valid || false,
        appId: debugData.data?.app_id,
        type: debugData.data?.type,
        expiresAt: debugData.data?.expires_at ? 
          new Date(debugData.data.expires_at * 1000).toISOString() : null,
        error: debugData.error?.message
      };
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        databaseToken: {
          found: !!dbToken,
          pageId: dbToken?.page_id,
          pageName: dbToken?.page_name,
          expiresAt: dbToken?.expires_at,
          isActive: dbToken?.is_active
        },
        apiToken: {
          found: !!apiToken,
          pageId: apiToken?.pageId,
          source: dbToken ? "database" : "environment"
        },
        expiryInfo: {
          ...expiryInfo,
          expiresIn: expiryInfo ? `${expiryInfo.days_remaining} days` : null
        },
        refreshStatus: {
          needsRefresh: needsRefresh,
          autoRefreshThreshold: "7 days"
        },
        facebookValidation: tokenValidation
      },
      summary: {
        tokenStatus: tokenValidation?.isValid ? "✅ Valid" : "❌ Invalid",
        expiresIn: expiryInfo ? `${expiryInfo.days_remaining} days` : "Unknown",
        needsRefresh: needsRefresh ? "Yes" : "No",
        source: dbToken ? "Database" : "Environment Variable"
      }
    });
    
  } catch (error) {
    console.error("Token manager test failed:", error);
    return NextResponse.json(
      { 
        error: "Test failed", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}