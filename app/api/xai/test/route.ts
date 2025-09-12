import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.XAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "XAI_API_KEY is not configured",
        configured: false
      }, { status: 500 });
    }

    // Test the API with a simple request
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          {
            role: "user",
            content: "Say 'API connection successful' in Turkish"
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({
        success: false,
        error: `XAI API error: ${response.status}`,
        details: error,
        configured: true
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      configured: true,
      message: "XAI API connection successful",
      response: data.choices[0]?.message?.content || "No response",
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error("Error testing XAI API:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to test XAI API",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}