import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const images = await sql`
      SELECT 
        id,
        original_prompt,
        enhanced_prompt,
        brand_id,
        size,
        style,
        status,
        cloudinary_url,
        cloudinary_public_id,
        created_at
      FROM generated_images
      ORDER BY created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      count: images.length,
      images: images
    });
  } catch (error) {
    console.error("Error fetching generated images:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch images",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}