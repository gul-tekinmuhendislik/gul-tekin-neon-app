import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Clear projeler table
    await sql`TRUNCATE TABLE projeler CASCADE`;
    
    return NextResponse.json({
      success: true,
      message: 'Projeler table cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing projeler table:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}