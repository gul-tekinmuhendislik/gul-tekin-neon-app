import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Drop unique constraint on slug if exists
    await sql`
      ALTER TABLE projeler DROP CONSTRAINT IF EXISTS projeler_slug_key
    `;
    
    // Add non-unique index for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_projeler_slug ON projeler(slug)
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Projeler slug constraint fixed successfully',
    });
  } catch (error) {
    console.error('Error fixing projeler slug constraint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}