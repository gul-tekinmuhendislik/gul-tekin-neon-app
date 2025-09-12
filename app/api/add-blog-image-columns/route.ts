import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // generated_content tablosuna image_prompt ve image_url kolonlarını ekle
    await sql`
      ALTER TABLE generated_content 
      ADD COLUMN IF NOT EXISTS image_prompt TEXT,
      ADD COLUMN IF NOT EXISTS image_url TEXT
    `;

    return NextResponse.json({
      success: true,
      message: 'Blog image columns added successfully'
    });
  } catch (error) {
    console.error('Error adding blog image columns:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add blog image columns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}