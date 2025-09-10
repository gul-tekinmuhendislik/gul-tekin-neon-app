import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    if (!pageId || !accessToken) {
      return NextResponse.json({
        error: "Facebook credentials not configured"
      }, { status: 400 });
    }
    
    // Test message
    const testMessage = `🔧 Test Post - ${new Date().toLocaleString('tr-TR')}
    
Gül-Tekin Mühendislik test mesajı.

#Test #GülTekinMühendislik`;
    
    // Make API request to Facebook
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${pageId}/feed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: testMessage,
          access_token: accessToken
        })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({
        error: "Facebook API error",
        details: data
      }, { status: response.status });
    }
    
    return NextResponse.json({
      success: true,
      message: "Test post sent to Facebook!",
      postId: data.id,
      postUrl: `https://www.facebook.com/${data.id}`
    });
    
  } catch (error) {
    console.error("Error posting to Facebook:", error);
    return NextResponse.json({
      error: "Failed to post to Facebook",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}