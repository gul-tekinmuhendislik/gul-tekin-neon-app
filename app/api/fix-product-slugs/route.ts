import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Find products with problematic slugs (containing quotes)
    const problematicProducts = await sql`
      SELECT id, urun_adi, slug 
      FROM urunler 
      WHERE slug LIKE '%"%' OR slug LIKE '%''%'
    `;

    console.log(`Found ${problematicProducts.length} products with problematic slugs`);

    // Fix each problematic slug
    const fixed = [];
    for (const product of problematicProducts) {
      // Remove quotes and other problematic characters from slug
      const cleanSlug = product.slug
        .replace(/['"]/g, '') // Remove quotes
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase();
      
      // Update the slug in database
      await sql`
        UPDATE urunler 
        SET slug = ${cleanSlug}
        WHERE id = ${product.id}
      `;
      
      fixed.push({
        id: product.id,
        oldSlug: product.slug,
        newSlug: cleanSlug,
        title: product.urun_adi
      });
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed.length} product slugs`,
      fixed: fixed
    });
  } catch (error) {
    console.error("Error fixing product slugs:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}