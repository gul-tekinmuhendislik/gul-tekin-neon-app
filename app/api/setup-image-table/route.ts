import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Create generated_images table
    await sql`
      CREATE TABLE IF NOT EXISTS generated_images (
        id SERIAL PRIMARY KEY,
        original_prompt TEXT NOT NULL,
        enhanced_prompt TEXT,
        brand_id TEXT,
        size VARCHAR(20),
        style VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        cloudinary_url TEXT,
        cloudinary_public_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_generated_images_brand_id ON generated_images(brand_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_generated_images_status ON generated_images(status);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);
    `;

    return NextResponse.json({
      success: true,
      message: "Generated images table created successfully",
      tables: ["generated_images"],
      indexes: [
        "idx_generated_images_brand_id",
        "idx_generated_images_status",
        "idx_generated_images_created_at"
      ]
    });
  } catch (error) {
    console.error("Error creating generated_images table:", error);
    return NextResponse.json(
      { 
        error: "Failed to create table",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}