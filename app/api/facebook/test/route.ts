import { NextResponse } from "next/server";
import { 
  getFacebookPageAccessToken, 
  validateAccessToken,
  postToFacebookPage,
  formatFacebookPost,
  generateHashtags 
} from "@/lib/facebook-api";

export async function GET() {
  try {
    console.log("Starting Facebook integration test...");
    
    // Test 1: Get Facebook credentials
    const credentials = await getFacebookPageAccessToken();
    
    if (!credentials) {
      return NextResponse.json({
        success: false,
        error: "Facebook credentials not configured",
        tests: {
          credentials: false,
          tokenValidation: false,
          apiConnection: false
        }
      }, { status: 500 });
    }
    
    console.log("Credentials found:", {
      pageId: credentials.pageId,
      hasToken: !!credentials.accessToken
    });
    
    // Test 2: Validate access token
    const isValid = await validateAccessToken(credentials.accessToken);
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: "Facebook access token is invalid or expired",
        tests: {
          credentials: true,
          tokenValidation: false,
          apiConnection: false
        }
      }, { status: 401 });
    }
    
    console.log("Token validation:", isValid);
    
    // Test 3: Test API connection (get page info)
    const pageInfoResponse = await fetch(
      `https://graph.facebook.com/v23.0/${credentials.pageId}?fields=name,id,access_token&access_token=${credentials.accessToken}`
    );
    
    if (!pageInfoResponse.ok) {
      const error = await pageInfoResponse.json();
      return NextResponse.json({
        success: false,
        error: "Failed to connect to Facebook API",
        details: error,
        tests: {
          credentials: true,
          tokenValidation: true,
          apiConnection: false
        }
      }, { status: 500 });
    }
    
    const pageInfo = await pageInfoResponse.json();
    console.log("Page info retrieved:", pageInfo);
    
    // Test 4: Test post formatting
    const testPostData = {
      title: "Test: Isı Pompası Verimliliği",
      excerpt: "Bu bir test gönderidir. Isı pompalarının enerji verimliliği hakkında bilgiler.",
      link: "https://gul-tekinmuhendislik.com/blog/test",
      hashtags: generateHashtags(["ısı pompası", "enerji verimliliği", "bodrum"])
    };
    
    const formattedPost = formatFacebookPost(testPostData);
    console.log("Formatted test post:", formattedPost);
    
    // Test 5: Get recent posts to verify permissions
    const recentPostsResponse = await fetch(
      `https://graph.facebook.com/v23.0/${credentials.pageId}/posts?limit=5&access_token=${credentials.accessToken}`
    );
    
    const recentPosts = recentPostsResponse.ok ? await recentPostsResponse.json() : null;
    
    return NextResponse.json({
      success: true,
      message: "Facebook integration test completed successfully",
      tests: {
        credentials: true,
        tokenValidation: true,
        apiConnection: true,
        pageInfo: {
          id: pageInfo.id,
          name: pageInfo.name
        },
        permissions: {
          canReadPosts: !!recentPosts,
          postsCount: recentPosts?.data?.length || 0
        },
        testPost: {
          formatted: formattedPost,
          hashtags: testPostData.hashtags
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Facebook test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      tests: {
        credentials: false,
        tokenValidation: false,
        apiConnection: false
      }
    }, { status: 500 });
  }
}

// Test POST endpoint - create a test post (only in development)
export async function POST(request: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({
        error: "Test posts are not allowed in production"
      }, { status: 403 });
    }
    
    const body = await request.json();
    const { message, dryRun = true } = body;
    
    const credentials = await getFacebookPageAccessToken();
    
    if (!credentials) {
      return NextResponse.json({
        error: "Facebook credentials not configured"
      }, { status: 500 });
    }
    
    const testPostData = {
      title: message || "Test Post from Gül-Tekin Mühendislik",
      excerpt: "Bu bir test gönderidir. Lütfen dikkate almayın.",
      link: "https://gul-tekinmuhendislik.com",
      hashtags: ["test", "development"]
    };
    
    if (dryRun) {
      const formattedPost = formatFacebookPost(testPostData);
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: "Test post prepared (dry run)",
        post: {
          formatted: formattedPost,
          data: testPostData
        }
      });
    }
    
    // Actually post to Facebook (be careful!)
    const result = await postToFacebookPage(
      testPostData,
      credentials.accessToken,
      credentials.pageId
    );
    
    if (!result) {
      return NextResponse.json({
        error: "Failed to create test post"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Test post created successfully",
      postId: result.id,
      warning: "This is a real post on Facebook. Remember to delete it!"
    });
    
  } catch (error) {
    console.error("Facebook test POST error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}