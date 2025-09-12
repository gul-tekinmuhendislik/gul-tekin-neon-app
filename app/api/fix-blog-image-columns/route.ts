import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // generated_content tablosundaki image_prompt ve image_url kolonlarını TEXT olarak değiştir
    await sql`
      ALTER TABLE generated_content 
      ALTER COLUMN image_prompt TYPE TEXT,
      ALTER COLUMN image_url TYPE TEXT
    `;

    return NextResponse.json({
      success: true,
      message: 'Blog image columns updated to TEXT type successfully'
    });
  } catch (error) {
    console.error('Error updating blog image columns:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update blog image columns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}