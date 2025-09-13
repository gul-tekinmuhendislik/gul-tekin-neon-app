import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // google_tokens tablosunu oluştur
    await sql`
      CREATE TABLE IF NOT EXISTS google_tokens (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) UNIQUE NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Tablo bilgilerini kontrol et
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'google_tokens'
      ORDER BY ordinal_position
    `;

    return NextResponse.json({
      success: true,
      message: 'google_tokens table created successfully',
      columns: tableInfo
    });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create table'
    }, { status: 500 });
  }
}