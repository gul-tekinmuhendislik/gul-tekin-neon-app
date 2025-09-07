import { NextResponse } from "next/server";
import { generateAndSaveContent, engineeringTopics } from "@/lib/content-generator";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic } = body;
    
    // Validate topic
    if (!topic || !engineeringTopics.includes(topic)) {
      return NextResponse.json(
        { 
          error: "Invalid topic",
          availableTopics: engineeringTopics 
        },
        { status: 400 }
      );
    }
    
    // Generate content
    const result = await generateAndSaveContent(topic);
    
    return NextResponse.json({
      ...result
    });
  } catch (error) {
    console.error("Error generating content:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get latest generated content
    const latestContent = await sql`
      SELECT 
        id,
        topic,
        title,
        meta_description,
        keywords,
        status,
        created_at
      FROM generated_content
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    return NextResponse.json({
      success: true,
      availableTopics: engineeringTopics,
      latestContent: latestContent
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}